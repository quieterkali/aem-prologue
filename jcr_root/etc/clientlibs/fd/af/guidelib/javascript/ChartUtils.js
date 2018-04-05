// jscs:disable requireDotNotation
/*
 * ***********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ***********************************************************************
 */

(function ($, guidelib, _) {
    var GuideUtil = guidelib.util.GuideUtil,
        CHART_TYPE = GuideUtil.chartType,

        ChartUtils = guidelib.chartUtils = {

            /**
             * Available reducer functions, that can be used for aggregate data per category.
             */
            reducerOptions : {
                /**
                 * Returns sum of values in the given array
                 * @param valArray
                 * @returns {number}
                 */
                sum : function (valArray) {
                    var sum = 0;
                    _.each(valArray, function (val) {
                        val = parseFloat(val);
                        sum = sum + val;
                    });
                    return sum;
                },

                /**
                 * Returns mean (average) of values in the given array
                 * @param valArray
                 * @returns {number}
                 */
                mean : function (valArray) {
                    var sum = 0,
                        count = 0,
                        mean = 0;
                    _.each(valArray, function (val) {
                        val = parseFloat(val);
                        sum = sum + val;
                        count = count + 1;
                    });

                    if (sum && count) {
                        mean = sum / count;
                    }

                    return mean;
                },

                /**
                 * Returns minimum value out of values in the given array
                 * @param valArray
                 * @returns {number}
                 */
                min : function (valArray) {
                    var min;
                    _.each(valArray, function (val) {
                        val = parseFloat(val);
                        if (!min || (min && min > val)) {
                            min = val;
                        }
                    });
                    return min;
                },

                /**
                 * Returns maximum value out of values in the given array
                 * @param valArray
                 * @returns {number}
                 */
                max : function (valArray) {
                    var max;
                    _.each(valArray, function (val) {
                        val = parseFloat(val);
                        if (!max || (max && max < val)) {
                            max = val;
                        }
                    });
                    return max;
                },

                /**
                 * Returns length of the given array
                 * @param valArray
                 * @returns {number}
                 */
                frequency : function (valArray) {
                    var frequency = 0;
                    if (valArray) {
                        frequency = valArray.length;
                    }
                    return frequency;
                },

                /**
                 * Returns mode - the value appearing maximum number of times, in the given array
                 * @param valArray
                 * @returns {number}
                 */
                mode : function (valArray) {
                    var mode,
                        maxFrequency = 0,
                        uniqueValFrequency = {};
                    _.each(valArray, function (val) {
                        if (uniqueValFrequency[val]) {
                            uniqueValFrequency[val] = uniqueValFrequency[val] + 1;
                        } else {
                            uniqueValFrequency[val] = 1;
                        }
                    });

                    _.each(uniqueValFrequency, function (frequency, val) {
                        if (maxFrequency < frequency) {
                            val = parseFloat(val);
                            mode = val;
                        }
                    });

                    return mode;
                },

                /**
                 * Returns median - mid point, of values in the given array
                 * @param valArray
                 * @returns {number}
                 */
                median : function (valArray) {
                    var median = 0;
                    if (valArray && valArray.length) {
                        if (valArray.length % 2) {
                            median = valArray[(valArray.length - 1) / 2];
                        } else {
                            median = (valArray[valArray.length / 2] + valArray[(valArray.length - 2) / 2]) / 2;
                        }
                    }
                    median = parseFloat(median);
                    return median;
                },

                /**
                 * Returns range - difference between maximum and minimum value, in the given array
                 * @param valArray
                 * @returns {number}
                 */
                range : function (valArray) {
                    var range = 0,
                        min,
                        max;
                    _.each(valArray, function (val) {
                        if (!min || (min && min > val)) {
                            min = val;
                        }
                        if (!max || (max && max < val)) {
                            max = val;
                        }
                    });

                    if ((min || min === 0) && (max || max === 0)) {
                        range = max - min;
                    }

                    return range;
                }
            },

            /**
             * Reads chart model for chart configuration and computes the data for chart
             * @param chartModel
             * @returns {{}}
             */
            gatherAxisData : function (chartModel) {
                var categoryExp,
                    valueExp,
                    reducerFunction,
                    repeatableInstances,
                    repeatableItem,
                    data = {},
                    dataToFill = {};
                dataToFill.value = [];
                dataToFill.label = [];

                repeatableItem = chartModel.getOrElse(guidelib.runtime, chartModel.repeatableItem, undefined);

                if (repeatableItem) {
                    repeatableInstances = repeatableItem.instanceManager.instances;
                }

                if (chartModel.reducerXFunction && chartModel.reducerXFunction !== 'none') {
                    categoryExp = chartModel.yExp;
                    valueExp = chartModel.xExp;
                    reducerFunction = chartModel.reducerXFunction;
                } else {
                    categoryExp = chartModel.xExp;
                    valueExp = chartModel.yExp;
                    if (chartModel.reducerYFunction && chartModel.reducerYFunction !== 'none') {
                        reducerFunction = chartModel.reducerYFunction;
                    }
                }

                _.each(repeatableInstances, function (repeatableInstance) {
                    var categoryPropVal = repeatableInstance[categoryExp].value,
                        valuePropVal = repeatableInstance[valueExp].value;
                    categoryPropVal = categoryPropVal ? categoryPropVal : '';
                    valuePropVal = valuePropVal ? valuePropVal : '';
                    if (reducerFunction) {
                        if (!data[categoryPropVal]) {
                            data[categoryPropVal] = [];
                        }
                        data[categoryPropVal].push(valuePropVal);
                    } else {
                        dataToFill.label.push(categoryPropVal);
                        dataToFill.value.push(valuePropVal);
                    }
                });

                if (reducerFunction) {
                    _.each(data, function (valArray, category) {
                        var val,
                            reducer = ChartUtils.reducerOptions[reducerFunction] || window[reducerFunction];
                        if (reducer) {
                            val = reducer(valArray, category);
                            dataToFill.label.push(category);
                            dataToFill.value.push(val);
                        }
                    });
                }

                return dataToFill;
            },

            /**
             * Returns dv.chart object created from chart model.
             * @param chartModel
             * @param $chartElement
             * @returns {dv.chart}
             */
            constructChart : function (chartModel, $chartElement) {
                var chartType = chartModel.chartType,
                    showLegends = chartModel.showLegends,
                    legendPosition = chartModel.legendPosition,
                    tooltipHtml = chartModel.tooltipHtml,
                    innerRadius = chartModel.innerRadius,
                    lineColor = chartModel.lineColor,
                    pointColor = chartModel.pointColor,
                    areaColor = chartModel.areaColor,
                    dataToFill = chartModel.data,
                    chartBehavior = [],
                    axisMap = {},
                    axisScale = {},
                    chartLayers,
                    chart,
                    categoryAxis,
                    valueAxis;
                if (chartModel.reducerXFunction && chartModel.reducerXFunction !== 'none') {
                    categoryAxis = 'y';
                    valueAxis = 'x';
                } else {
                    categoryAxis = 'x';
                    valueAxis = 'y';
                }

                axisMap[categoryAxis] = 'label';
                axisMap[valueAxis] = 'value';
                axisScale[valueAxis] = dv.scale.linear().lowerLimit(0);

                try {
                    if (GuideUtil.isChartTooltipApplicable(chartType)) {
                        if (tooltipHtml && tooltipHtml !== '') {
                            var xValMap = axisMap['x'],
                                yValMap = axisMap['y'];
                            chartBehavior = [dv.behavior.rollover().content(function (d) {
                                var tooltip = tooltipHtml.replace(/\${x}/g, d.data[xValMap]);
                                tooltip = tooltip.replace(/\${y}/g, d.data[yValMap]);
                                return tooltip;
                            })];
                        }
                    }
                    axisScale[categoryAxis] = dv.scale.ordinal();
                    chart = dv.chart();
                    chart.map('fill', 'label')
                        .map('x', axisMap['x'], axisScale['x'])
                        .map('y', axisMap['y'], axisScale['y']);

                    var chartPoint = dv.geom.point().set('fill', pointColor).behaviors(chartBehavior),
                        chartLine = dv.geom.line().set('fill', lineColor),
                        chartArea = dv.geom.area().set('alpha', 0.1).set('fill', areaColor),
                        flippedCaretesianCoord = dv.coord.cartesian().flip(true),
                        lineCommon = function () {
                            chart.set('stroke', lineColor);
                            chartLayers = [dv.geom.line()];
                        },
                        barTypeCommon = function () {
                            chartLayers = [dv.geom.bar().behaviors(chartBehavior)];
                            chart.map('x', 'label', axisScale[categoryAxis])
                                .map('y', 'value');
                        },
                        barCommon = function () {
                            barTypeCommon();
                            if (categoryAxis === 'x') {
                                chart.coord(flippedCaretesianCoord);
                            }
                        },
                        columnCommon = function () {
                            barTypeCommon();
                            if (categoryAxis === 'y') {
                                chart.coord(flippedCaretesianCoord);
                            }
                        },
                        pieCommon = function (radius) {
                            columnCommon();
                            dataToFill[categoryAxis] = Array.apply(null, Array(dataToFill["label"].length)).map(function () {
                                return 1;
                            });
                            axisMap[categoryAxis] = categoryAxis;
                            if (radius > 0) {
                                axisScale[categoryAxis] = axisScale[categoryAxis].padding(.3);
                            }

                            chart.map('x', axisMap[categoryAxis], axisScale[categoryAxis]);

                            chart.coord(dv.coord.polar().flip(true).innerRadius(radius))
                                .guide(['x', 'y'], 'none')
                                .position('fill');
                        };

                    switch (chartType) {
                        case CHART_TYPE.LINE:
                            lineCommon();
                            chartLayers.push(chartLine);
                            break;
                        case CHART_TYPE.POINT:
                            lineCommon();
                            chartLayers.push(chartPoint);
                            break;
                        case CHART_TYPE.AREA:
                            lineCommon();
                            chartLayers.push(chartLine);
                            chartLayers.push(chartArea);
                            break;
                        case CHART_TYPE.LINE_POINT:
                            lineCommon();
                            chartLayers.push(chartPoint);
                            chartLayers.push(chartLine);
                            break;
                        case CHART_TYPE.BAR:
                            barCommon();
                            break;
                        case CHART_TYPE.COLUMN:
                            columnCommon();
                            break;
                        case CHART_TYPE.PIE:
                            pieCommon(0);
                            break;
                        case CHART_TYPE.DONUT:
                            pieCommon(innerRadius);
                            break;
                    }

                    chart.layers(chartLayers);
                    chart.data(dataToFill)
                        .width(chartModel.width + '%')
                        .height(chartModel.height)
                        .parent("#" + $chartElement.attr('id'))
                        .padding({"left" : 10, "top" : 10, "right" : 10, "bottom" : 10});

                    if (GuideUtil.isChartAxisTitleApplicable(chartType)) {
                        chart.guide('x', dv.guide.axis().title(chartModel.xAxisTitle))
                            .guide('y', dv.guide.axis().title(chartModel.yAxisTitle));
                    }

                    if (GuideUtil.isChartLegendApplicable(chartType) && showLegends) {
                        chart.guide('fill', dv.guide.legend().orientation(legendPosition));
                    }
                } catch (exception) {
                    window.guideBridge._guide.logger().log("Error while constructing chart " + exception);
                }
                return chart;
            }
        };
}($, guidelib, _));

//Poly-filling request animation frame function for IE 9
(function () {
    var lastFramePaintTime = 0;
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastFramePaintTime)), //16-16 frames per second
                id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    }, timeToCall);
            lastFramePaintTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());
