import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches render and lazy-chunk failures (typically a flaky network or a deploy that replaced a file) so the
 * learner sees a recoverable message instead of a blank page. Reset by navigating to another route.
 */
class Boundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route failed to render", error, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    const offline =
      typeof navigator !== "undefined" && navigator.onLine === false;
    return (
      <main id="main" className="workspace-page" role="alert">
        <h1>This page did not load.</h1>
        <p>
          {offline
            ? "You appear to be offline. Pages you have not opened before need a connection."
            : "Something went wrong while loading this page. Your progress on this device is safe."}
        </p>
        <p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload the page
          </button>{" "}
          <a href="/">Return home</a>
        </p>
      </main>
    );
  }
}

export function RouteErrorBoundary({ children }: Props) {
  const { pathname } = useLocation();
  return <Boundary key={pathname}>{children}</Boundary>;
}
