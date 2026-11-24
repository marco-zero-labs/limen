import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, View, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, floatingShadow, radius } from '@/theme/tokens';
import { useLayout } from '@/theme/useLayout';
import { Button } from './Button';
import { Txt } from './Txt';

/* ---------- Toast com "Desfazer" ---------- */

type ToastMsg = { id: number; text: string; undo?: () => void | Promise<void> };
type ConfirmReq = { title: string; body?: string; confirm: string; resolve: (ok: boolean) => void };

type Ctx = {
  toast: (text: string, undo?: () => void | Promise<void>) => void;
  /** Modal só para confirmação destrutiva. */
  confirm: (opts: { title: string; body?: string; confirm: string }) => Promise<boolean>;
};

const FeedbackCtx = createContext<Ctx>({ toast: () => {}, confirm: async () => false });
export const useFeedback = () => useContext(FeedbackCtx);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const [req, setReq] = useState<ConfirmReq | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const toast = useCallback((text: string, undo?: () => void | Promise<void>) => {
    if (timer.current) clearTimeout(timer.current);
    const id = ++seq.current;
    setMsg({ id, text, undo });
    timer.current = setTimeout(() => setMsg((m) => (m?.id === id ? null : m)), undo ? 6000 : 3500);
  }, []);

  const confirm = useCallback(
    (opts: { title: string; body?: string; confirm: string }) =>
      new Promise<boolean>((resolve) => setReq({ ...opts, resolve })),
    [],
  );

  return (
    <FeedbackCtx.Provider value={{ toast, confirm }}>
      {children}
      <ToastView msg={msg} onClose={() => setMsg(null)} />
      <ConfirmDialog req={req} onDone={() => setReq(null)} />
    </FeedbackCtx.Provider>
  );
}

function ToastView({ msg, onClose }: { msg: ToastMsg | null; onClose: () => void }) {
  const { wide } = useLayout();
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, { toValue: msg ? 1 : 0, duration: 150, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [msg, opacity]);
  if (!msg) return null;
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: wide ? 24 : insets.bottom + 72,
        alignItems: wide ? 'flex-start' : 'center',
        paddingLeft: wide ? 232 + 32 : 16,
        paddingRight: 16,
        opacity,
      }}
    >
      <View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 40,
          maxWidth: 480,
          paddingLeft: 12,
          paddingRight: msg.undo ? 4 : 12,
          paddingVertical: 4,
          borderRadius: radius.lg,
          backgroundColor: colors.ink,
          ...floatingShadow,
        }}
      >
        <Txt color="#FFFFFF" style={{ flexShrink: 1 }}>
          {msg.text}
        </Txt>
        {msg.undo ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Desfazer"
            onPress={async () => {
              const u = msg.undo;
              onClose();
              await u?.();
            }}
            style={{ minHeight: 44, minWidth: 44, paddingHorizontal: 8, justifyContent: 'center' }}
          >
            <Txt w={600} color="#FFFFFF">
              Desfazer
            </Txt>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

function ConfirmDialog({ req, onDone }: { req: ConfirmReq | null; onDone: () => void }) {
  const close = (ok: boolean) => {
    req?.resolve(ok);
    onDone();
  };
  return (
    <Modal visible={!!req} transparent animationType="fade" onRequestClose={() => close(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(28,43,46,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={{ width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 24, gap: 16, ...floatingShadow }}
        >
          <Txt v="title" style={{ fontSize: 18, lineHeight: 24 }}>
            {req?.title}
          </Txt>
          {req?.body ? <Txt muted>{req.body}</Txt> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <Button label="Cancelar" onPress={() => close(false)} />
            <Button label={req?.confirm ?? 'Confirmar'} kind="primary" onPress={() => close(true)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Estados ---------- */

/** Skeleton no formato do conteúdo, só após 400ms. */
export function SkeletonList({ rows = 6, label = 'Carregando' }: { rows?: number; label?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <View accessibilityLabel={label} accessibilityRole="progressbar" style={{ gap: 0 }}>
      {show
        ? Array.from({ length: rows }).map((_, i) => (
            <View key={i} style={{ paddingVertical: 14, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.line2 }}>
              <View style={{ width: [200, 160, 220, 140, 180, 170][i % 6], height: 12, borderRadius: radius.sm, backgroundColor: colors.line2 }} />
              <View style={{ width: [120, 90, 140, 100, 110, 80][i % 6], height: 12, borderRadius: radius.sm, backgroundColor: colors.line2 }} />
            </View>
          ))
        : null}
    </View>
  );
}

export function ErrorBlock({ title, body, onRetry }: { title: string; body?: string; onRetry: () => void }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.line, borderLeftWidth: 3, borderLeftColor: colors.error, borderRadius: radius.lg, padding: 16, gap: 8 }} accessibilityRole="alert">
      <Txt w={500}>{title}</Txt>
      {body ? <Txt muted>{body}</Txt> : null}
      <Button label="Tentar de novo" onPress={onRetry} />
    </View>
  );
}
