var Rx = require('rx');
var React = require('react');

var assign = require('object-assign');

var FixedScrollTable = React.createClass({

  getInitialState: function () {
    return {
      visibleIndices: []
    };
  },

  render: function () {
    // render the container first,
    // then render into that later with knowledge of the container
    var containerStyle = {
      position: 'relative',
      height: this.props.containerHeight,
      overflowX: 'hidden'
    };

    return (
      <div className="fixed-scroll-element-container">
        <div
          ref="HeaderContainer"
          className="fixed-scroll-element-header">
        </div>
        <div
          ref="Container"
          className="fixed-scroll-element"
          style={containerStyle}/>
      </div>
    );
  },

  deferredRender: function (containerWidth) {
    // this is the render for when the container has been rendered
    // and we know explicitly the container width
    var rows = this.state.visibleIndices.map((itemIndex, keyIndex) => {
      var top = itemIndex * this.props.rowHeight;
      return this.props.rowGetter(itemIndex, keyIndex, top, containerWidth);
    });

    return (
      <table
        style={{height: this.props.rowCount * this.props.rowHeight}}>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  },

  componentDidUpdate: function () {
    // do the actual render when the component updates itself
    var containerWidth = this.containerNode.offsetWidth;
    var output = this.deferredRender(containerWidth);
    React.render(output, this.containerNode);

    // render the header with the same constraints as the rows
    React.render((
      <table>
        <thead>
          {this.props.headerGetter(containerWidth)}
        </thead>
      </table>
    ), this.headerContainerNode);
  },

  componentDidMount: function () {
    // get the nodes and store them, don't want to look them up every time
    this.containerNode = React.findDOMNode(this.refs.Container);
    this.headerContainerNode = React.findDOMNode(this.refs.HeaderContainer);

    // set up the table and the scroll observer
    this.setUpTable();

    // have the component rerender when the window resizes,
    // as the container width might have changed
    var windowResizeStream = Rx.Observable.fromEvent(window, 'resize').debounce(50);
    this.windowResizeSubscription = windowResizeStream.subscribe(() => {
      this.forceUpdate();
    });
  },

  componentWillUnmount: function () {
    // cleaning up time...
    this.windowResizeSubscription.dispose();
    this.visibleIndicesSubscription.dispose();
    React.unmountComponentAtNode(this.containerNode);
    React.unmountComponentAtNode(this.headerContainerNode);
  },

  setUpTable: function () {
    var containerHeight = this.props.containerHeight;
    var rowHeight = this.props.rowHeight;
    var rowCount = this.props.rowCount;

    var visibleRows = Math.ceil(containerHeight/ rowHeight);

    var getScrollTop = () => {
      return this.containerNode.scrollTop;
    };

    var initialScrollSubject = new Rx.ReplaySubject(1);
    initialScrollSubject.onNext(getScrollTop());

    var scrollTopStream = initialScrollSubject.merge(
      Rx.Observable.fromEvent(this.containerNode, 'scroll').map(getScrollTop)
    );

    var firstVisibleRowStream = scrollTopStream.map(function (scrollTop) {
      return Math.floor(scrollTop / rowHeight);
    }).distinctUntilChanged();

    var visibleIndicesStream = firstVisibleRowStream.map(function (firstRow) {
      var visibleIndices = [];
      var lastRow = firstRow + visibleRows + 1;

      if (lastRow > rowCount) {
        firstRow -= lastRow - rowCount;
      }

      for (var i = 0; i <= visibleRows; i++) {
        visibleIndices.push(i + firstRow);
      }
      return visibleIndices;
    });

    this.visibleIndicesSubscription = visibleIndicesStream.subscribe((indices) => {
      this.setState({
        visibleIndices: indices
      });
    });
  }
});

module.exports = FixedScrollTable;
