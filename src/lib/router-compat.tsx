// Thin compatibility layer so the screens imported from the original Waypoint
// repo (written for react-router) run on TanStack Router unchanged.
import { createContext, useContext, useEffect, type ReactNode, type MouseEventHandler } from 'react';
import {
  Link as TsLink,
  Outlet as TsOutlet,
  useNavigate as useTsNavigate,
  useLocation as useTsLocation,
  useParams as useTsParams,
} from '@tanstack/react-router';

const OutletCtx = createContext<unknown>(undefined);

export function Outlet({ context }: { context?: unknown }) {
  const parent = useContext(OutletCtx);
  return (
    <OutletCtx.Provider value={context === undefined ? parent : context}>
      <TsOutlet />
    </OutletCtx.Provider>
  );
}

export function useOutletContext<T = unknown>(): T {
  return useContext(OutletCtx) as T;
}

export function useNavigate() {
  const navigate = useTsNavigate();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }
    void navigate({ to, replace: opts?.replace ?? false });
  };
}

export function useLocation() {
  return useTsLocation();
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return useTsParams({ strict: false }) as unknown as T;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: replace ?? false });
  }, [to]);
  return null;
}

type LinkProps = {
  to: string;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  'aria-label'?: string;
  title?: string;
};

export function Link({ to, className, children, ...rest }: LinkProps) {
  return (
    <TsLink to={to as never} className={className} {...rest}>
      {children}
    </TsLink>
  );
}

type NavLinkProps = Omit<LinkProps, 'className' | 'children'> & {
  end?: boolean;
  className?: string | ((s: { isActive: boolean }) => string);
  children?: ReactNode | ((s: { isActive: boolean }) => ReactNode);
};

export function NavLink({ to, end, className, children, ...rest }: NavLinkProps) {
  const { pathname } = useTsLocation();
  const clean = pathname.replace(/\/$/, '') || '/';
  const isActive = end ? clean === to : clean === to || clean.startsWith(`${to}/`);
  const cls = typeof className === 'function' ? className({ isActive }) : className;
  return (
    <TsLink to={to as never} className={cls} activeProps={{}} inactiveProps={{}} aria-current={isActive ? 'page' : undefined} {...rest}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </TsLink>
  );
}
