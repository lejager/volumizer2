import React from 'react';

export default class ToggleSwitch extends React.Component {
  static propTypes = {
    on: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    enabled: React.PropTypes.bool,
    className: React.PropTypes.string
  };

  static defaultProps = {
    on: false,
    onClick: () => {},
    enabled: true,
    className: ''
  };

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({on: nextProps.on});
  }

  handleClick = (e) => {
    e.preventDefault();
    if(this.props.enabled) {
      this.props.onClick();
      this.setState({on: !this.state.on});
    }
  };

  render() {
    const className = ['switch', this.props.className, (this.props.toggle ? 'on ' : ''), (this.props.enabled ? '' : 'disabled ')].join(' ');
    return (
      <div className={className} onClick={this.handleClick}>
        <div className="switch-toggle" children={this.props.children}></div>
      </div>
    );
  }
}