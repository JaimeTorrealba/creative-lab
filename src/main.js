import { createApp } from 'vue'
import App from './App.vue'
import Tres from '@tresjs/core'
import router from "./router";
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import 'bulma/css/bulma.css'

const app = createApp(App)

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark'
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})


app.use(Tres)
app.use(vuetify)
app.use(router);
app.mount('#app')
