import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page wish-page">
          <div className="flex flex-col items-center gap-4 p-[60px_20px] text-center">
            <span className="text-5xl">🎂💥</span>
            <h2 className="font-display font-extrabold text-2xl text-coral m-0">
              Something went wrong
            </h2>
            <p className="m-0 opacity-75 max-w-[320px]">
              The birthday surprise hit a snag. Try reloading!
            </p>
            <div className="flex gap-4 items-center mt-2">
              <button
                className="bg-coral text-white font-display font-bold text-base px-6 py-2.5 rounded-full border-none cursor-pointer"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <a className="text-mint font-bold no-underline hover:underline" href="/create">
                Create a New Wish
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
