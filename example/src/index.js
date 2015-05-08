var React = require('react');
var Rx = require('rx');

var assign = require('object-assign');

var FixedScrollTable = require('../../lib/godforsaken-dynamic-width-scroll-table.js');

function getColumnWidths(rowWidth, columnStyles) {
  var computation = columnStyles.reduce(function (agg, style) {
    if (style.width) {
      agg.remainingWidth -= style.width;
      agg.customWidthColumns -= 1;
    }
    return agg;
  }, {
    autoSizeColumns: columnStyles.length,
    remainingWidth: rowWidth
  });

  var standardWidth = computation.remainingWidth / computation.autoSizeColumns;

  return columnStyles.map(function (style) {
    if (style.width) {
      return style.width;
    } else {
      return standardWidth;
    }
  });
}

function getColumnStyles(columnStyles, columnWidths) {
  return columnStyles.map(function (style, i) {
    return assign({}, style, {width: columnWidths[i]});
  });
}

var ExampleTable = React.createClass({

  getInitialState: function () {
    return {
      columnStyles: [{
        width: 250
      }, {
      }, {
      }]
    };
  },

  getRow: function (itemIndex, keyIndex, top, rowWidth) {
    var rowStyle = {
      position: 'absolute',
      top: top,
      width: '100%',
      borderBottom: '1px solid grey'
    };
    var columnWidths = getColumnWidths(rowWidth, this.state.columnStyles);
    var columnStyles = getColumnStyles(this.state.columnStyles, columnWidths);
    return (
      <tr key={keyIndex} style={rowStyle}>
        <td style={columnStyles[0]}>{itemIndex}</td>
        <td style={columnStyles[1]}>5 * itemIndex === {5 * itemIndex}</td>
        <td style={columnStyles[2]}>{Math.random() * 10000}</td>
      </tr>
    );
  },

  getHeader: function (rowWidth) {
    var columnWidths = getColumnWidths(rowWidth, this.state.columnStyles);
    var columnStyles = getColumnStyles(this.state.columnStyles, columnWidths);
    return (
      <tr>
        <th style={columnStyles[0]}>Id</th>
        <th style={columnStyles[1]}>Content</th>
        <th style={columnStyles[2]}>SDVXCf</th>
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
