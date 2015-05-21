var React = require('react');
var Rx = require('rx');

var assign = require('object-assign');

var FixedScrollTable = require('../../lib/godforsaken-dynamic-width-scroll-table');
var getColumnWidths = require('../../lib/get-column-widths');

var ExampleTable = React.createClass({

  getInitialState: function () {
    return {
      columnWidths: [
        250,
        null,
        null
      ]
    };
  },

  getRow: function (itemIndex, keyIndex, top, rowWidth) {
    var rowStyle = {
      position: 'absolute',
      top: top,
      width: '100%',
      borderBottom: '1px solid grey'
    };
    var columnWidths = getColumnWidths(rowWidth, this.state.columnWidths);
    return (
      <tr key={keyIndex} style={rowStyle}>
        <td style={{width: columnWidths[0]}}>{itemIndex}</td>
        <td style={{width: columnWidths[1]}}>5 * itemIndex === {5 * itemIndex}</td>
        <td style={{width: columnWidths[2]}}>{Math.random() * 10000}</td>
      </tr>
    );
  },

  getHeader: function (rowWidth) {
    var columnWidths = getColumnWidths(rowWidth, this.state.columnWidths);
    return (
      <tr>
        <th style={{width: columnWidths[0]}}>Id</th>
        <th style={{width: columnWidths[1]}}>Content</th>
        <th style={{width: columnWidths[2]}}>SDVXCf</th>
      </tr>
    );
  },

  render: function () {
    return (
      <FixedScrollTable
        containerHeight={500}
        rowHeight={50}
        rowCount={10000}
        rowGetter={this.getRow}
        headerGetter={this.getHeader}
      />
    );
  }

});

React.render(
  <ExampleTable/>,
  document.getElementById('app')
);
