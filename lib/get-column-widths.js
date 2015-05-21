function getColumnWidths(rowWidth, columnWidths) {
  var computation = columnWidths.reduce(function (agg, width) {
    if (typeof width === 'number') {
      agg.remainingWidth -= width;
      agg.customWidthColumns -= 1;
    }
    return agg;
  }, {
    autoSizeColumns: columnWidths.length,
    remainingWidth: rowWidth
  });

  var standardWidth = computation.remainingWidth / computation.autoSizeColumns;

  return columnWidths.map(function (width) {
    if (width) {
      return width;
    } else {
      return standardWidth;
    }
  });
}

module.exports = getColumnWidths;
