import { createContext, DependencyList, ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LocalRepository } from './local';
import type { Repository } from './repository';
import { storage } from './storage';
import { ProfileKind, USERS } from './types';
import type { Viewer } from '@/domain/permissions';

const SESSION_KEY = 'ekklesia.session.v1';

type Session = { profile: ProfileKind; userId: string } | null;

type Ctx = {
  repo: Repository;
  session: Session;
  sessionReady: boolean;
  signIn: (p: ProfileKind) => Promise<void>;
  signOut: () => Promise<void>;
};

const DataCtx = createContext<Ctx | null>(null);

/** Uma instância por app. Trocar por SupabaseRepository aqui, sem mexer nas telas. */
const repository: Repository = new LocalRepository();

export function DataProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [sessionReady, setReady] = useState(false);

  useEffect(() => {
    storage.get(SESSION_KEY).then((raw) => {
      if (raw) {
        try {
          const s = JSON.parse(raw) as Session;
          if (s && USERS[s.profile]) setSession({ profile: s.profile, userId: USERS[s.profile].personId });
        } catch {
          /* ignora */
        }
      }
      setReady(true);
    });
  }, []);

  const signIn = useCallback(async (profile: ProfileKind) => {
    const s = { profile, userId: USERS[profile].personId };
    setSession(s);
    await storage.set(SESSION_KEY, JSON.stringify(s));
  }, []);

  const signOut = useCallback(async () => {
    setSession(null);
    await storage.remove(SESSION_KEY);
  }, []);

  const value = useMemo(() => ({ repo: repository, session, sessionReady, signIn, signOut }), [session, sessionReady, signIn, signOut]);
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

function useCtx() {
  const c = useContext(DataCtx);
  if (!c) throw new Error('DataProvider ausente');
  return c;
}

export const useRepo = () => useCtx().repo;
export const useSession = () => {
  const { session, sessionReady, signIn, signOut } = useCtx();
  return { session, sessionReady, signIn, signOut };
};

/** O usuário logado como "viewer" das regras de permissão. Use só dentro da área logada. */
export function useViewer(): Viewer {
  const { session } = useCtx();
  return session ?? { profile: 'pastor', userId: USERS.pastor.personId };
}

export type Query<T> = { data: T | undefined; loading: boolean; error: Error | null; reload: () => void };

/**
 * Consulta ao repositório. Recarrega sozinha quando os dados mudam.
 * `loading` só é verdadeiro na primeira carga (recargas mantêm os dados na tela).
 */
export function useQuery<T>(fn: (repo: Repository) => Promise<T>, deps: DependencyList = []): Query<T> {
  const repo = useRepo();
  const [state, setState] = useState<{ data: T | undefined; loading: boolean; error: Error | null }>({ data: undefined, loading: true, error: null });
  // sempre a versão mais nova de `fn`, sem precisar dela nas dependências dos efeitos
  const fnRef = useRef(fn);
  useLayoutEffect(() => {
    fnRef.current = fn;
  });
  const seq = useRef(0);

  // só muda o estado quando a resposta chega (a mais recente vence)
  const load = useCallback(() => {
    const id = ++seq.current;
    fnRef
      .current(repo)
      .then((data) => {
        if (id === seq.current) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (id === seq.current) setState({ data: undefined, loading: false, error });
      });
  }, [repo]);

  // deps novas: volta a "carregando" já nesta renderização, mantendo os dados na tela
  const [prevDeps, setPrevDeps] = useState(deps);
  if (!sameDeps(prevDeps, deps)) {
    setPrevDeps(deps);
    setState((s) => ({ data: s.data, loading: true, error: null }));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- quem chama decide, pelas deps, quando recarregar
  useEffect(() => load(), [load, ...deps]);
  useEffect(() => repo.subscribe(() => load()), [repo, load]);

  const reload = () => {
    setState((s) => ({ data: s.data, loading: true, error: null }));
    load();
  };
  return { ...state, reload };
}

function sameDeps(a: DependencyList, b: DependencyList) {
  return a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
}
