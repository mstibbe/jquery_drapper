(function ($) {
  $.drappers = {};

  $.fn.drapper = function (options) {
    options = $.extend({}, options);
    options.drapperIdentifier = "data-drapper";
    options.elementSelector = options.elementSelector || '[' + options.drapperIdentifier + ']';

    var drapperMethods = function (decoree) {
      var _hashConfig = (function () {
        var _rawAttributeData = $(decoree).attr(options.drapperIdentifier);
        var result = {};
        var _attributeData;

        try {
          _attributeData = eval("({" + _rawAttributeData + "})"); //TODO: eval is evil
        } catch (e) {
          throw ("Drapper attributes are invalid. It should be as 'drapperName: config'. 'config' is a JSON. \n" +
                 "Original error message: \n" + e.message);
        }

        $.each(_attributeData, function (key, value) {
          result['drapperType'] = key;
          result['drapperConfig'] = value;
        });
        return result;
      }());

      var _type = function () { return _hashConfig.drapperType; };
      var config = function () { return _hashConfig.drapperConfig; };

      function wrapper() {
        var findFakeDiv = function () {
          var a = $(decoree).next('div[data-drapper-wrapper]');
          if (a.length === 0) {
            return false;
          } else {
            return a;
          }
        };
        var createFakeDiv = function () {
          var fakeDiv = $(document.createElement('div'));
          fakeDiv.attr({
            'data-drapper-wrapper': true,
            'class': 'drapperWrapper'
          });
          $(decoree).after(fakeDiv);
          return fakeDiv;
        };
        return findFakeDiv() || createFakeDiv();
      }

      function drapperConverter() {
        var converterPlugin = $.drappers[_type()];

        if (converterPlugin === undefined) {
          throw "Undefined drapper extension '" + _type() + "'. " +
                "Please, provide 'jquery.drapper.'" + _type() + "' plugin. " +
                "See https://github.com/aratak/jquery_drapper/ for details.";
        }

        return converterPlugin.call(decoree);
      }

      function init() {
        $.extend(decoree, {
          'isDecoree': true,
          'drapperType': _type(),
          'config': config(),
          'wrapper': wrapper
        });
        return drapperConverter();
      }

      return init();
    };

    return this.each(function () {
      $(this).find(options.elementSelector).each(function () {
        if (!this.isDecoree) {
          drapperMethods(this);
        }
      });
    });
  };
}(jQuery));
