ALTER TABLE public.dispatch_plan ADD COLUMN edit_version integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.apply_dispatch_draft_edit(p_plan_id uuid, p_expected_version integer, p_trips jsonb, p_deferrals jsonb)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_plan public.dispatch_plan%ROWTYPE;
  v_trip jsonb;
  v_stop jsonb;
  v_def jsonb;
  v_trip_id uuid;
  v_ids uuid[];
  v_old_ids uuid[];
  v_new_ids uuid[];
  v_count integer;
BEGIN
  IF auth.uid() IS NULL OR NOT (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'DISPATCHER')) THEN
    RAISE EXCEPTION 'Only dispatchers may edit a plan';
  END IF;
  SELECT * INTO v_plan FROM public.dispatch_plan WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND OR v_plan.status <> 'DRAFT' OR v_plan.edit_version <> p_expected_version THEN
    RAISE EXCEPTION 'The draft changed. Refresh the plan and try again.';
  END IF;
  IF public.has_role(auth.uid(), 'DISPATCHER') AND NOT public.has_role(auth.uid(), 'ADMIN')
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND depot_id = v_plan.depot_id) THEN
    RAISE EXCEPTION 'This depot is not assigned to you';
  END IF;
  IF EXISTS (SELECT 1 FROM public.trip t WHERE t.plan_id = p_plan_id AND
      (t.status <> 'DRAFT' OR t.started_at IS NOT NULL OR EXISTS (
        SELECT 1 FROM public.trip_stop s WHERE s.trip_id = t.id AND (s.status <> 'PLANNED' OR s.loading_status <> 'PENDING')))) THEN
    RAISE EXCEPTION 'Loading or driving has started; the plan cannot be edited.';
  END IF;
  SELECT array_agg(order_id) INTO v_old_ids FROM (
    SELECT s.order_id FROM public.trip_stop s JOIN public.trip t ON t.id = s.trip_id WHERE t.plan_id = p_plan_id
    UNION ALL SELECT order_id FROM public.deferral_record WHERE plan_id = p_plan_id
  ) old_orders;
  SELECT array_agg(x.order_id) INTO v_new_ids FROM (
    SELECT (s->>'orderId')::uuid AS order_id FROM jsonb_array_elements(p_trips) t,
      jsonb_array_elements(t->'orderIds') s
    UNION ALL SELECT (d->>'orderId')::uuid FROM jsonb_array_elements(p_deferrals) d
  ) x;
  IF coalesce(array_length(v_old_ids, 1), 0) <> coalesce(array_length(v_new_ids, 1), 0)
     OR EXISTS (SELECT 1 FROM unnest(coalesce(v_old_ids, '{}'::uuid[])) x GROUP BY x HAVING count(*) > 1)
     OR EXISTS (SELECT 1 FROM unnest(coalesce(v_new_ids, '{}'::uuid[])) x GROUP BY x HAVING count(*) > 1)
     OR EXISTS (SELECT unnest(coalesce(v_old_ids, '{}'::uuid[]) ) EXCEPT SELECT unnest(coalesce(v_new_ids, '{}'::uuid[]))) THEN
    RAISE EXCEPTION 'The edited plan must include every order exactly once.';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_trips) x WHERE NOT EXISTS (
    SELECT 1 FROM public.vehicle v WHERE v.id = x->>'vehicleId' AND v.home_depot_id = v_plan.depot_id AND v.status = 'AVAILABLE')) THEN
    RAISE EXCEPTION 'A selected vehicle is unavailable or belongs to a different depot.';
  END IF;
  -- Replace only a still-unstarted draft, in one transaction. Reuse trip IDs so open route links stay valid.
  DELETE FROM public.trip_stop WHERE trip_id IN (SELECT id FROM public.trip WHERE plan_id = p_plan_id);
  DELETE FROM public.trip WHERE plan_id = p_plan_id;
  DELETE FROM public.deferral_record WHERE plan_id = p_plan_id;
  FOR v_trip IN SELECT value FROM jsonb_array_elements(p_trips) LOOP
    v_trip_id := (v_trip->>'id')::uuid;
    INSERT INTO public.trip (id, plan_id, vehicle_id, trip_no, brand, district_id, temp_class,
      planned_minutes, total_weight_kg, total_volume_m3, est_km, est_fuel_l, status)
    VALUES (v_trip_id, p_plan_id, v_trip->>'vehicleId', (v_trip->>'tripNo')::integer,
      v_trip->>'brand', v_trip->>'districtId', v_trip->>'tempClass',
      (v_trip->>'plannedMinutes')::integer, (v_trip->>'weightKg')::numeric,
      (v_trip->>'volumeM3')::numeric, (v_trip->>'estKm')::numeric, (v_trip->>'estFuelL')::numeric, 'DRAFT');
    FOR v_stop IN SELECT value FROM jsonb_array_elements(v_trip->'stops') LOOP
      INSERT INTO public.trip_stop (trip_id, order_id, seq, planned_arrival, handling_allowance_min, status)
      VALUES (v_trip_id, (v_stop->>'orderId')::uuid, (v_stop->>'seq')::integer,
        (v_stop->>'arrival')::timestamptz, (v_stop->>'allowance')::integer, 'PLANNED');
      UPDATE public.orders SET status = 'PLANNED' WHERE id = (v_stop->>'orderId')::uuid;
    END LOOP;
  END LOOP;
  FOR v_def IN SELECT value FROM jsonb_array_elements(p_deferrals) LOOP
    INSERT INTO public.deferral_record (order_id, plan_id, reason_code, unavoidable, priority_score, score_breakdown, dispatcher_note, notified_at)
    VALUES ((v_def->>'orderId')::uuid, p_plan_id, v_def->>'reasonCode', (v_def->>'unavoidable')::boolean,
      (v_def->>'priorityScore')::numeric, v_def->'scoreBreakdown', v_def->>'reason', now());
    UPDATE public.orders SET status = 'DEFERRED' WHERE id = (v_def->>'orderId')::uuid;
  END LOOP;
  UPDATE public.dispatch_plan SET edit_version = edit_version + 1 WHERE id = p_plan_id RETURNING edit_version INTO v_count;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_dispatch_draft_edit(uuid, integer, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_dispatch_draft_edit(uuid, integer, jsonb, jsonb) TO authenticated;