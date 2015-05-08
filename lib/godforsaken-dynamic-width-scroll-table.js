var Rx = require('rx');
var React = require('react');

var assign = require('object-assign');

var FixedScrollTable = React.createClass({

  getDefaultProps: function () {
    return {
      containerHeight: 400,
      rowHeight: 40
    };
  },

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
      <div>
        <div ref="HeaderContainer">
        </div>
        <div
          ref="Container"
          className="fixed-scroll-element"
          style={containerStyle}
          {...this.props.containerOverrides}/>
      </div>
    );
  },

  deferredRender: function (containerWidth) {
    // this is the render for when the container has been rendered
    // and we know explicitly the container width
    var rows = this.state.visibleIndices.map(function (itemIndex, keyIndex) {
      var top = itemIndex * this.props.rowHeight;
      return this.props.rowGetter(itemIndex, keyIndex, top, containerWidth);
    }.bind(this));

    return (
      <table
        style={{height: this.props.rowCount * this.props.rowHeight}}
        {...this.props.elementOverrides}>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  },

  componentDidUpdate: function () {
    // do the actual render when the component updates itself
    var containerNode = React.findDOMNode(this.refs.Container);
    var containerWidth = containerNode.offsetWidth;
    var output = this.deferredRender(containerWidth);
    React.render(output, containerNode);

    // render the header with the same constraints as the rows
    var headerContainerNode = React.findDOMNode(this.refs.HeaderContainer);
    React.render((
      <table>
        <thead>
          {this.props.headerGetter(containerWidth)}
        </thead>
      </table>
    ), headerContainerNode);
  },

  componentDidMount: function () {
    // set up the table and the scroll observer
    this.setUpTable();

    // have the component rerender when the window resizes,
    // as the container width might have changed
    this.windowResizeSubscription = Rx.Observable.fromEvent(window, 'resize').debounce(50).subscribe(function () {
      this.forceUpdate();
    }.bind(this));
  },

  componentWillUnmount: function () {
    // cleaning up time...
    this.windowResizeSubscription.dispose();
    this.visibleIndicesSubscription.dispose();
  },

  setUpTable: function () {
    var containerHeight = this.props.containerHeight;
    var rowHeight = this.props.rowHeight;
    var rowCount = this.props.rowCount;
    var tableNode = React.findDOMNode(this.refs.Container);

    var visibleRows = Math.ceil(containerHeight/ rowHeight);

    var getScrollTop = function () {
      return tableNode.scrollTop;
    };

    var initialScrollSubject = new Rx.ReplaySubject(1);
    initialScrollSubject.onNext(getScrollTop());

    var scrollTopStream = initialScrollSubject.merge(
      Rx.Observable.fromEvent(tableNode, 'scroll').map(getScrollTop)
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

    this.visibleIndicesSubscription = visibleIndicesStream.subscribe(function (indices) {
      this.setState({
        visibleIndices: indices
      });
    }.bind(this));
  }
});

module.exports = FixedScrollTable;
