/*
 * Power meter app. An express frontend to reading a power meter with a
 * flashing led using a photo resistive sensor on an Arduino Uno board.
 *
 * This is most of all a toy experiment to get me up to speed on some of
 * the latest web technologies.
 *
 * @author Thomas Malt <thomas@malt.no>
 * @copyright Thomas Malt <thomas@malt.no>
 *
 */

/**
 * meter - helper object literal to scope utility functions so that they
 * don't mess with anything else.
 */
var meter = {
    weeklyHeight: 132,
    initialize: {},
    load: {},
    fb: {
        login: null,
        user: null
    }
};

meter.initialize.gauge = function (PowerWatts) {
    PowerWatts.get({interval: 10}, function(p) {
        
    
        meter.gauge = c3.generate({
            bindto: '#meter',
            size: {
                width: 372,
                height: 300
            },
            data: {
                columns: [
                    ['data', p.watt]
                ],
                type: 'gauge'
            },
            gauge: {
                label: {
                    format: function (value, ratio) {
                        return '';
                    },
                    show: true
                },
                min: 0,
                max: 12000,
                units: '',
                width: 42
            },
            color: {
                pattern: ['#43cee6', '#f0b840', '#ef4e3a'],
                threshold: {
                    unit: 'value',
                    max: 12000,
                    values: [6000, 9000, 12000]
                }
            }
        });
    });
};

meter.initialize.hourChart = function (PowerWatts) {
    PowerWatts.get({interval: 'hour'}, function (d) {
        var values = d.items.map(function(item) { return item.watts; });
        var times  = d.items.map(function(item) { 
            var time = new Date(item.timestamp);
            return time.toTimeString().slice(0,5);
        });

        values.unshift('watts');
        times.unshift('x');
        meter.hourChart = c3.generate({
            bindto: '#hourChart',
            size: { height: 148 },
            padding: {
                left: 20,
                right: 20,
                top: 0,
                bottom: 0
            },
            legend: { show: false },
            point: { show: false },
            axis: {
                x: {
                    show: true,
                    tick: {
                        count: 12
                    },
                    type: 'categorized'
                },
                y: {
                    show: false
                }
            },
            grid: {
                y: {
                    lines: [
                        {value: 2000, text: '2000 W'},
                        {value: 4000, text: '4000 W'},
                        {value: 6000, text: '6000 W'},
                        {value: 8000, text: '8000 W'},
                        {value: 10000, text: '10000 W'}
                    ]
                }
            },
            data: {
                x: 'x',
                columns: [
                    times,
                    values
                ],
                types: {
                    watts: 'area-spline'
                },
                colors: {
                    watts: '#43cee6'
                }
            }
        });

    });
};

meter.initialize.threeDaysChart = function (PowerKwh) {
    PowerKwh.get({type: 'hour', count: 73}, function (d) {
        var values = d.list.map(function(item) {
            var date = new Date(item.timestamp);
            return [
                "" + date.getDate() + "/" + (date.getMonth()+1),
                item.kwh
            ];
        });

        values.unshift(['x', 'kwh per hour']);

        meter.threeDaysChart = c3.generate({
            bindto: '#three-days-chart',
            size: { height: meter.weeklyHeight },
            padding: {
                left: 20,
                right: 20,
                top: 0,
                bottom: 0
            },
            legend: { show: false },
            point: { show: false },
            axis: {
                x: {
                    show: true,
                    tick: {
                        count: 4
                        /* culling: {
                         max: 9
                         } */
                    },
                    type: 'category'
                },
                y: { show: false}
            },
            bar: {
                width: {
                    ratio: 1.0
                }
            },
            grid: {
                y: {
                    lines: [
                        {value: 2.0, text: '2 kWh'},
                        {value: 4.0, text: '4 kWh'},
                        {value: 6.0, text: '6 kWh'},
                        {value: 8.0, text: '8 kWh'},
                        {value: 10.0, text: '10 kWh'}
                    ]
                }
            },
            data: {
                x: 'x',
                rows: values,
                types: {
                    'kwh per hour': 'area-spline'
                },
                colors: {
                    'kwh per hour': '#f0b840'
                }
            }
        });
    });
};

meter.initialize.monthChart = function (PowerKwh) {
    PowerKwh.get({type: 'day', count: 62}, function (d) {
        var values = d.list.map(function(item) {
            if (item === null) {
                return ["", 0];
            }
            var date = new Date(item.timestamp);
            return [
                "" + date.getDate() + "/" + (date.getMonth()+1),
                item.kwh
            ];
        });

        values.unshift(['x', 'kwh per day']);

        meter.monthChart = c3.generate({
            bindto: '#month-chart',
            size: { height: meter.weeklyHeight },
            padding: {
                left: 20,
                right: 20,
                top: 0,
                bottom: 0
            },
            legend: { show: false },
            point: { show: false },
            axis: {
                x: {
                    show: true,
                    tick: {
                        count: 8
                        /* culling: {
                         max: 9
                         } */
                    },
                    type: 'category'
                },
                y: { show: false}
            },
            bar: {
                width: {
                    ratio: 0.6
                }
            },
            grid: {
                y: {
                    lines: [
                        {value: 25.0, text: '25 kWh'},
                        {value: 50.0, text: '50 kWh'},
                        {value: 75.0, text: '75 kWh'},
                        {value: 100.0, text: '100 kWh'},
                        {value: 125.0, text: '125 kWh'}
                    ]
                }
            },
            data: {
                x: 'x',
                rows: values,
                types: {
                    'kwh per day': 'area'
                },
                colors: {
                    'kwh per day': '#f0b840'
                }
            }
        });
    });
};

meter.initialize.weeklyChart = function (PowerKwh) {
    PowerKwh.get({type: 'week', count: 52}, function (d) {
        console.log("meter.initialize.weeklyChart: ", d);
        var values = d.list.map(function(item) {
            if (item === null) {
                return [" ", 0];
            }
            var date = new Date(item.timestamp);
            return [
                "" + date.getDate() + "/" + (date.getMonth()+1),
                item.kwh
            ];
        });

        values.unshift(['x', 'kwh per week']);

        meter.weeklyChart = c3.generate({
            bindto: '#weekly-chart',
            size: { height: meter.weeklyHeight },
            padding: {
                left: 20,
                right: 20,
                top: 0,
                bottom: 0
            },
            legend: { show: false },
            point: { show: false },
            axis: {
                x: {
                    show: true,
                    tick: {
                        count: 4
                    },
                    type: 'category'
                },
                y: { show: false}
            },
            grid: {
                y: {
                    lines: [
                        {value: 200.0, text: '200 kWh'},
                        {value: 400.0, text: '400 kWh'},
                        {value: 600.0, text: '600 kWh'}
                    ]
                }
            },
            data: {
                x: 'x',
                rows: values,
                types: {
                    'kwh per week': 'area'
                },
                colors: {
                    'kwh per week': '#f0b840'
                }
            }
        });
    });
};

meter.load.threeDaysChart = function (PowerKwh) {
    PowerKwh.get({type: 'hour', count: 73}, function (d) {
        var values = d.list.map(function(item) {
            var date = new Date(item.timestamp);
            return [
                "" + date.getDate() + "/" + (date.getMonth()+1),
                item.kwh
            ];
        });
        values.unshift(['x', 'kwh per hour']);

        meter.threeDaysChart.load({ rows: values });
    });
};

meter.load.weeklyChart = function (PowerKwh) {
    PowerKwh.get({type: 'week', count: 52}, function (d) {
        var values = d.items.map(function (item) {
            if (item === null) {
                return [" ", 0];
            }
            var date = new Date(item.timestamp);
            return [
                "" + date.getDate() + "/" + (date.getMonth() + 1),
                item.kwh
            ];
        });

        values.unshift(['x', 'kwh per week']);

        meter.weeklyChart.load({ rows: values });
    });
};

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2016 Thomas Malt <thomas@malt.no>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

