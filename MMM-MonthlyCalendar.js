// MMM-MonthlyCalendar.js

function el(tag, options) {
  var result = document.createElement(tag);

  options = options || {};
  for (var key in options) {
    result[key] = options[key];
  }

  return result;
}

function addOneDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}

function diffDays(a, b) {
  a = new Date(a);
  b = new Date(b);
  
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);

  return Math.round((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

Module.register("MMM-MonthlyCalendar", {
  // Default module config
  defaults: {
    hideCalendars: [],
  },

  start: function() {
    var self = this;

    self.events = [];

    // TODO: Set timer to refresh events?
  },

  notificationReceived: function(notification, payload) {
    var self = this;

    if (notification === "CALENDAR_EVENTS") {
      self.events = payload.map(e => {
        e.startDate = new Date(+e.startDate);
        e.endDate = new Date(+e.endDate);

        if (e.fullDayEvent) {
          e.endDate = new Date(e.endDate.getTime() - 1000);
        }

        return e;
      }).filter(e => {
        return !self.config.hideCalendars.includes(e.calendarName);
      });

      self.updateDom();
    }
  },

  getStyles: function () {
    return ["MMM-MonthlyCalendar.css"];
  },

  getDom: function() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var self = this;
    var now = new Date();
    var table = el("table", { "className": "small wrapper" });
    var row = el("tr");
    var cell;

    for (var day in days) {
      row.appendChild(el("th", { "className": "header", "innerHTML": days[day] }));
    }
    table.appendChild(row);

    var date = 1 - new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    var monthDays = 32 - new Date(now.getFullYear(), now.getMonth(), 32).getDate();
    var today = now.getDate();
    var dateCells = [];

    for (var week = 0; week < 6 && date <= monthDays; ++week) {
      row = el("tr", { "className": "xsmall" });

      for (day = 0; day < 7; ++day, ++date) {
        cell = el("td", { "className": "cell" });
        if (date === today) {
          cell.classList.add("today");
        }
        var cellText = date;
        if (date <= 0 || monthDays < date) {
          cellText = new Date(now.getFullYear(), now.getMonth(), date).getDate();
          cell.classList.add("dimmer");
        }
        cell.appendChild(el("div", { "innerHTML": cellText }));
        row.appendChild(cell);
        dateCells[date] = cell;
      }

      table.appendChild(row);
    }

    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    var monthEnd = new Date(now.getFullYear(), now.getMonth(), monthDays, 23, 59, 59);
    for (var i in self.events) {
      var e = self.events[i];
      var text = e.title;

      for (date = e.startDate; date <= e.endDate; date = addOneDay(date)) {
        var dayDiff = diffDays(date, monthStart);

        if (dayDiff in dateCells) {
          if (!e.fullDayEvent) {
            function formatTime(d) {
              function z(n) {
                return (n < 10 ? "0" : "") + n;
              }
              var h = d.getHours();
              var m = z(d.getMinutes());
              if (config.timeFormat === 12) {
                return (h % 12 || 12) + ":" + m + (h < 12 ? "am" : "pm");
              } else {
                return h + ":" + m;
              }
            }
            text = formatTime(e.startDate) + " " + text;
          }
          dateCells[dayDiff].appendChild(el("div", { "className": "event", "innerText": text }));
        }
      }
    }

    return table;
  },
});