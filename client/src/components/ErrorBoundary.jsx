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
          <div className="error-boundary">
            <span className="error-boundary__icon">🎂💥</span>
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__msg">
              The birthday surprise hit a snag. Try reloading!
            </p>
            <div className="error-boundary__actions">
              <button className="error-boundary__btn" onClick={this.handleRetry}>
                Try Again
              </button>
              <a className="error-boundary__link" href="/create">
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
