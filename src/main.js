module.exports = {
  install: function (Vue, locale_translations) {

    Vue.locale_translations = locale_translations;

    Vue.replace_vars = function (translation, vars) {
      let replaced = translation;

      for (var key in vars) {
        replaced = replaced.replace(`{${key}}`, vars[key]);
      }

      return replaced;
    }

    Vue.directive('trans', {
      params: ['key', 'replace'],

      update: function (locale) {
        // reset content
        let original = this.vm.$t(this.params.key, { locale: 'default' });

        let original_substrings = original.split('|');

        let children = this.el.children;

        for (let i = 0; i < children.length; i++) {
          children[i].innerText = original_substrings[i];
        }

        // do translation
        let translation = this.vm.$t(this.params.key, this.params.replace || {});

        let initial_substrings = this.params.key.split('|');
        let translated_substrings = translation.split('|');

        children = this.el.children;

        for (let i = 0; i < children.length; i++) {
          let index = initial_substrings.indexOf(children[i].innerText);

          if (index > -1) {
            children[i].innerText = translated_substrings[index];
          }
        }
      }
    });



    Vue.prototype.$t = function (key, vars) {
      var currentLocale = (vars && vars['locale']) ? vars['locale'] : this.$root.locale
        var translations = Vue.locale_translations[currentLocale]

        if (translations) {
          if (key in translations) {
            return Vue.replace_vars(translations[key], vars);
          }

          // Also fall back to a sublocale, e.g. "fr" translations from the locale "fr_CA"
          if (currentLocale && (currentLocale.indexOf('_') > -1)) {
            var sublocale = currentLocale.slice(0, 2)

            translations = locale_translations[sublocale]

            if (translations && (key in translations)) {
              return Vue.replace_vars(translations[key], vars);
            }
          }

          if (window.console) {
            console.warn(`Translations exist for the locale ${currentLocale}, but there is not an entry for '${key}'`)
          }
        }

        return Vue.replace_vars(key, vars)
      }

      Vue.filter('translate', function (key, vars) {
        return this.$t(key, vars)
      })
    }
  }

