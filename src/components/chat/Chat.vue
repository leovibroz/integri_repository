<template>
  <div class="chat-wrapper">
    <div class="chat-header">
      <v-toolbar dark class="chat-customized-toolbar">
        <img :src="require('@/assets/svg/home/logo_chatbot.svg')" alt="">
        <img :src="require('@/assets/svg/home/Integri.svg')" alt="Integri" class="text-part">
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
    </div>
    <h5 class="sound-warning" :class="{'animated pulse infinite': !notificationRead}">
      Ligue seu som ou coloque fones de ouvido e aguarde até o fim das sentenças para digitar. <v-icon right class="white--text">fas fa-headphones</v-icon>
      <v-btn v-if="!notificationRead" @click="notificationRead = true">Entendi</v-btn>
    </h5>
    <div class="chatbox-messages">
      <div class="chatbox-messages-wrapper">
        <div class="chatbox-dialog-line" v-for="(message, index) in chat" :key="index" :class="{ deactivated: !message.active && message.type === 'yn_question' }">
          <v-layout align-end>
            <v-avatar v-if="message.sender === 'watson'" class="white levi">
              <img :src="require('@/assets/png/logo/super_feliz.png')" alt="">
            </v-avatar>
            <div class="chatbox-watson" v-if="message.sender === 'watson'" v-html="message.message"></div>
            <v-icon class="audio-feedback white--text" :class="{'animated pulse infinite': message.isPlaying}" v-if="message.isPlaying">fas fa-volume-up</v-icon>
          </v-layout>
          <v-container grid-list-xs text-xs-center v-if="message.videos">
            <carousel :perPage="1" :navigationEnabled="true" class="video-slider">
              <slide v-for="(groups,i) in videosGroups" :key="i">
                <v-layout row wrap>
                  <v-flex class="video-card" d-flex xs6 sm3 v-for="(video,i) in groups" :key="i" @click="showModal(video)">
                    <v-card>
                      <img class="video-thumbnail" :src="video.snippet.thumbnails.medium.url" alt="">
                      <v-card-text>{{ video.snippet.title }}</v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>
              </slide>
            </carousel>
          </v-container>
          <v-container grid-list-xs text-xs-center v-if="message.opportunities">
            <carousel :perPage="1" :navigationEnabled="true" class="video-slider">
              <slide v-for="(groups,i) in opptyGroups" :key="i">
                <v-layout row wrap>
                  <v-flex class="video-card" d-flex xs6 sm3 v-for="(oppty,i) in groups" :key="i" @click="goToOppty(oppty)">
                    <v-card>
                      <div class="thumbnail-opportunity">
                        <img class="video-thumbnail" :src="oppty.image.image_small_url" alt="">
                      </div>
                      <v-card-text>{{ oppty.name }}</v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>
              </slide>
            </carousel>
          </v-container>
          <div class="chatbox-user" v-if="message.sender === 'user'">{{ message.message }}</div>
          <v-container grid-list-xs v-if="message.type === 'yn_question' && message.active">
            <v-layout row wrap class="chatbox-yn-question" >
              <v-flex xs12 md3 @click.stop="YNSelector('yes', message)">
                <v-btn block flat large>
                  {{ message.options.yes }}
                  <v-icon right dark v-if="message.action === 'feedback'">fa fa-thumbs-up</v-icon>
                </v-btn>
              </v-flex>
              <v-flex xs12 md3 @click.stop="YNSelector(false, message)">
                <v-btn block flat large>
                  {{ message.options.no }}
                  <v-icon right dark v-if="message.action === 'feedback'">fa fa-thumbs-down</v-icon>
                </v-btn>
              </v-flex>
              <v-flex xs12 md3 v-if="message.options.cancel">
                <v-btn block flat large @click.stop="openLink(message.options.cancel.link)">
                  {{ message.options.cancel.text }}
                </v-btn>
              </v-flex>
              <v-flex xs12 md3 @click.stop="YNSelector('oppty', message)" v-if="message.options.oppty">
                <v-btn block flat large>
                  {{ message.options.oppty }}
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
        <div class="chatbox-dialog-line" :class="{'hidden':!isTyping}">
          <div class="chatbox-typing">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        <v-dialog v-model="displayLoginBox" persistent content-class="show-overflow" :fullscreen="$vuetify.breakpoint.smAndDown" :max-width="$vuetify.breakpoint.width * 0.65">
          <form class="login-dialog-wrapper">
            <div class="login-dialog-title">
              <div class="login-feather-detail">
                <img :src="require('@/assets/svg/login/integri_login.svg')" alt="">
              </div>
            </div>
            <div class="login-form">
              <div class="input-addon">
                <v-text-field solo label="Nome" v-model="newUser.name" prepend-icon="far fa-user" required></v-text-field>
              </div>
              <div class="input-addon">
                <v-text-field solo label="E-mail" v-model="newUser.email" prepend-icon="far fa-envelope" type="email" required></v-text-field>
              </div>
              <div class="input-addon">
                <v-text-field solo label="Senha" type="password" v-model="newUser.pwd" prepend-icon="fas fa-lock" required></v-text-field>
              </div>
              <div class="input-addon">
                <v-text-field solo label="Confirme sua senha" type="password" v-model="newUser._pwdConf" prepend-icon="fas fa-lock" required></v-text-field>
              </div>
              <v-layout>
                <v-flex>
                  <span class="savebox-error-msg animated pulse" v-if="error">{{ error.message }}</span>
                </v-flex>
              </v-layout>
            </div>
            <v-btn class="blue--text darken-1 login-cancel" flat @click.native="displayLoginBox = false">Cancelar</v-btn>
            <v-btn class="blue--text darken-1 login-submit" type="button" :disabled="!(newUser.pwd === newUser._pwdConf && newUser.pwd.length > 0)" flat @click.native="saveProfile">Enviar</v-btn>
          </form>
        </v-dialog>
      </div>
      <div class="chatbox-footer" :class="{'box': select1.active || select2.active, 'box-disabled': !inputBoxEnabled}">
        <input ref="inputbox" type="text" class="chat-input" v-model="message" :disabled="!inputBoxEnabled" v-focus="inputBoxEnabled" v-on:keyup.enter="submit" v-if="inputboxactive">
        <v-layout class="selections" v-if="select1.active || select2.active" row wrap>
          <v-flex xs12 md6 lg4 class="selection-box">
            <v-select solo v-on:keyup.enter="submit" v-bind:items="select1.items" :disabled="!inputBoxEnabled" single-line :multiple="select1.multi" return-object :no-data-text="select1.noData" :item-text="select1.item_text" :item-value="select1.item_value" v-model="select1.model" clearable :label="select1.label" v-if="select1.active" autocomplete :append-icon="select1.icon"></v-select>
          </v-flex>
          <v-flex xs12 md6 lg4 class="selection-box">
            <v-select solo v-on:keyup.enter="submit" v-bind:items="select2.items" :disabled="!inputBoxEnabled" :multiple="select2.multi" v-model="select2.model" :label="select2.label" v-if="select2.active" autocomplete clearable :prepend-icon="select2.icon"></v-select>
          </v-flex>
        </v-layout>
        <v-btn icon flat v-if="canSend" :disabled="!canSend" @click="submit">
          <v-icon>send</v-icon>
        </v-btn>
        <!-- <v-icon v-if="!canSend" @click="recognizeMicro" :class="{'error--text animated pulse ininite': isRecognizing}">fas fa-microphone</v-icon> -->
      </div>
    </div>
    <v-dialog v-model="showVideo" persistent :max-width="currentVideo.thumbnail.width" :width="currentVideo.thumbnail.width">
      <div class="floating-video">
        <span class="close-btn" @click="closeModal"><i class="fa fa-chevron-left" aria-hidden="true"></i>Voltar</span>
        <youtube :video-id="currentVideo.id" :player-vars="{ autoplay: 1 }" :player-width="currentVideo.thumbnail.width" :player-height="currentVideo.thumbnail.height" class="responsive-yt" @ready="ready"></youtube>
      </div>
    </v-dialog>
  </div>
</template>
<script>
import axios from 'axios'
import WatsonSpeech from 'watson-speech'
// import io from 'socket.io-client'
// const stt = io('')
export default {
  computed: {
    causes () {
      return this.$store.getters.getCauses
    },
    capturedDialog () {
      return this.$store.getters.getCapturedDialog
    },
    chat () {
      return this.$store.getters.getChat
    },
    isTyping () {
      return this.$store.getters.isTyping
    },
    isDenied () {
      return this.$store.getters.getUser.access_denied
    },
    askingProfile () {
      return this.$store.getters.displayChat.askingProfile
    },
    states () {
      return this.$store.getters.getStatesCities
    },
    skills () {
      return this.$store.getters.getSkills
    },
    select1Model () {
      return this.select1.model
    },
    canSend () {
      return this.message.length > 0 || this.select1.active && this.select1.model && (this.select1.isParent && this.select2.model || !this.select1.isParent)
    },
    returnedVideos () {
      return this.$store.getters.getRelevant
    },
    returnedOppty () {
      return this.$store.getters.getOpportunities
    },
    opptyGroups () {
      let groups = []
      let index = 0
      this.returnedOppty.forEach(oppty => {
        if (groups.length < 1) {
          groups.push([])
        }
        if (groups[index].length < 4) {
          groups[index].push(oppty)
        } else {
          index++
          groups.push([])
          groups[index].push(oppty)
        }
      })
      return groups
    },
    userData () {
      return this.$store.getters.getUser
    },
    videosGroups () {
      let groups = []
      let index = 0
      this.returnedVideos.forEach(vid => {
        if (groups.length < 1) {
          groups.push([])
        }
        if (groups[index].length < 4) {
          groups[index].push(vid)
        } else {
          index++
          groups.push([])
          groups[index].push(vid)
        }
      })
      return groups
    },
    inputboxactive () {
      return !this.select1.active && !this.select2.active
    },
    gettingProfile () {
      return this.$store.getters.isLeviGettingProfile
    }
  },
  watch: {
    chat (newVal) {
      if (newVal) {
        let chat = document.querySelector('.chatbox-messages-wrapper')
        setTimeout(() => {
          chat.scrollTop = chat.scrollHeight
        }, 350)
      }
    },
    select1Model () {
      if (this.select1Model.cidades) {
        this.select2.items = this.select1Model.cidades
        this.select2.active = true
        this.select2.icon = 'place'
      }
    },
    isTyping (val) {
      if (val) {
        this.inputBoxEnabled = false
      }
    },
    displayLoginBox (val) {
      if (val) {
        this.inputBoxEnabled = false
      }
    }
  },
  data () {
    return {
      audio: null,
      axiosUrl: '',
      axiosConfig: {},
      axiosOppty: '',
      currentVideo: {
        active: false,
        id: '',
        thumbnail: {
          width: '',
          height: '',
          url: ''
        }
      },
      inputBoxEnabled: false,
      isRecognizing: false,
      message: '',
      displayLoginBox: false,
      newUser: {
        name: '',
        email: '',
        pwd: '',
        _pwdConf: '',
        like: []
      },
      newDialog: null,
      notificationRead: false,
      video_group: [],
      valid: false,
      select1: {
        icon: '',
        isParent: false,
        items: [],
        model: '',
        label: '',
        active: false,
        multi: false,
        item_value: '',
        item_text: ''
      },
      select2: {
        icon: '',
        items: [],
        model: '',
        label: '',
        active: false,
        multi: false,
        item_value: '',
        item_text: ''
      },
      showVideo: false,
      stt: null,
      tts: null,
      ttsAudioStream: [],
      error: {
        message: ''
      },
      feedback: null,
      isFeedback: null
    }
  },
  directives: {
    focus: {
      update: (el, binding, vnode) => {
        if (binding) {
          el.focus()
        }
      }
    }
  },
  methods: {
    ready (player) {
      this.player = player
    },
    showMore () {
      this.display += 4
    },
    showModal (video) {
      this.currentVideo.thumbnail = video.snippet.thumbnails.high
      this.currentVideo.id = video.id
      this.showVideo = true
    },
    closeModal () {
      this.player.stopVideo()
      this.showVideo = false
    },
    setSelect (target, payload) {
      for (let prop in payload) {
        target[prop] = payload[prop]
      }
    },
    recognizeMicro () {
      this.isRecognizing = true
      let stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
        token: this.$store.getters.getSTTToken,
        model: 'pt-BR_BroadbandModel',
        inactivity_timeout: 3,
        smart_formatting: true,
        object_mode: false
      })
      stream.setEncoding('utf8')
      stream.on('data', data => {
        console.log(data)
        if (this.message) {
          this.message += data
        } else {
          this.message = data
        }
      })
      stream.on('close', (reasonCode, description) => {
        console.log('CLOSE')
        console.log(reasonCode)
        console.log(description)
      })
      stream.on('message', (message, data) => {
        console.log('message')
        console.log(message)
        console.log('Data')
        console.log(data)
      })
      stream.on('error', (err) => {
        console.log(err)
        if (this.message) {
          this.isRecognizing = false
          this.submit()
        }
        stream.stop()
      })
    },
    adjustLocationByOppty () {
      if (this.newUser.location) {
        if (this.needAPIBeta(this.newUser.location)) {
          this.axiosUrl = 'https://api.beta.atados.com.br/'
          this.axiosConfig = {headers: {'X-ovp-channel': 'pv'}}
          this.axiosOppty = 'https://parceirosvoluntarios.atados.com.br/vaga/'
        } else {
          this.axiosUrl = 'https://v2.api.atados.com.br/'
          this.axiosConfig = {headers: {'X-ovp-channel': 'default'}}
          this.axiosOppty = 'https://www.atados.com.br/vaga/'
        }
      } else if (this.needAPIBeta(this.userData.user_data.location)) {
        this.axiosUrl = 'https://api.beta.atados.com.br/'
        this.axiosConfig = {headers: {'X-ovp-channel': 'pv'}}
        this.axiosOppty = 'https://parceirosvoluntarios.atados.com.br/vaga/'
      } else {
        this.axiosUrl = 'https://v2.api.atados.com.br/'
        this.axiosConfig = {headers: {'X-ovp-channel': 'default'}}
        this.axiosOppty = 'https://www.atados.com.br/vaga/'
      }
    },
    needAPIBeta (value) {
      value = value.toLowerCase()
      if (value.includes('rio grande do sul')) {
        return true
      } else {
        return this.states.some(state => {
          if (state.sigla === 'RS') {
            return state.cidades.some(city => {
              return value.includes(city.toLowerCase())
            })
          } else {
            return false
          }
        })
      }
    },
    gotohook (hook) {
      console.log(hook)
      switch (hook) {
        case 'relevant':
          document.querySelector('.relevant-title').scrollIntoView({
            behavior: 'smooth'
          })
          break
      }
    },
    goToOppty (oppty) {
      this.adjustLocationByOppty()
      window.open(this.axiosOppty + oppty.slug, '_blank')
    },
    YNSelector (payload, message) {
      message.active = false
      if (payload) {
        if (message.action === 'save_profile') {
          this.displayLoginBox = true
        } else {
          this.message = message.options[payload]
          if (message.action === 'feedback') {
            this.feedback = true
          }
          this.$nextTick().then(() => {
            this.submit()
          })
        }
      } else {
        this.message = message.options.no
        if (message.action === 'feedback') {
          this.feedback = false
        }
        this.$nextTick().then(() => {
          this.submit()
        })
      }
      this.inputBoxEnabled = true
    },
    processAudioQueue (collection) {
      return new Promise((resolve, reject) => {
        if (collection.length > 0) {
          let synth = collection.shift()
          this.synthesizeAndDisplay(synth.text).then(resp => {
            resp.audio.load()
            resp.audio.oncanplay = () => {
              this.$store.commit('DEACTIVATE_TYPING')
              this.inputBoxEnabled = false
              resp.audio.play()
              this.$store.commit('ADD_TEXT', {
                sender: 'watson',
                message: resp.text,
                videos: synth.data.context.display === 'videos' ? true : null,
                opportunities: synth.data.context.display === 'opportunity' ? true : null,
                isPlaying: true
              })
              if (synth.data.context.video && synth.data.context.display) {
                this.$store.commit('SET_RELEVANT', synth.data.context.video)
                delete synth.data.context.display
                delete synth.data.context.video
                this.$store.commit('SET_CONTEXT', synth.data.context)
              }
              if (synth.data.context.opportunities) {
                this.$store.commit('SET_OPPORTUNITIES', synth.data.context.opportunities)
                delete synth.data.context.display
                delete synth.data.context.opportunities
                this.$store.commit('SET_CONTEXT', synth.data.context)
              }
            }
            resp.audio.onended = () => {
              this.$store.commit('STOP_SPEECH_ANIMATION')
              this.audio.src = null
              this.processAudioQueue(collection).then(() => {
                resolve(true)
              })
            }
          })
        } else {
          this.inputBoxEnabled = true
          resolve(true)
        }
      })
    },
    processMessage (response) {
      console.log(response)
      switch (response.data.context.capture_user_feedback) {
        case 'started':
          if (!this.capturedDialog) {
            this.newDialog = {
              _id: Date.now(),
              captured: Date.now(),
              messages: []
            }
          } else {
            this.newDialog = this.capturedDialog
          }
          response.data.output.text.forEach((text, index) => {
            this.newDialog.messages.push({
              sender: 'watson',
              message: text
            })
          })
          this.$store.commit('SET_CAPTURED_DIALOG', this.newDialog)
          break
        case 'finished':
          axios.post('/api/conversation/savedialog', {data: this.capturedDialog}).then(resp => {
            console.log(resp)
          }).catch(err => {
            if (err.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(err.response.data)
              console.log(err.response.status)
              console.log(err.response.headers)
            } else if (err.request) {
              // The request was made but no response was received
              // `err.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(err.request)
            } else {
              // Something happened in setting up the request that triggered an err
              console.log('err', err.message)
            }
            console.log(err.config)
          })
          response.data.context.capture_user_feedback = null
          break
      }
      switch (response.data.context.hook) {
        case 'login':
          delete response.data.context.hook
          this.$store.commit('SET_CONTEXT', response.data.context)
          this.$store.commit('SET_LOGIN_RETURN', '/home')
          this.$router.push('login')
          break
        case 'conteudo':
          this.$router.push('conteudo')
          break
      }
      this.$store.commit('SET_CONTEXT', response.data.context)
      // Direct responses
      let synthesisQueue = response.data.output.text.map((text, index) => {
        if (text.includes('user_name')) {
          text = text.replace('user_name', this.$store.getters.getUser.user_data.name)
        }
        if (text.includes('social_media')) {
          text = text.replace('social_media', this.$store.getters.getAccessSource)
        }
        return new Promise((resolve, reject) => {
          resolve({ audio: null, data: response.data, text })
        })
      })
      Promise.all(synthesisQueue).then(processedSynth => {
        this.processAudioQueue(processedSynth).then(res => {
          // Question options
          if (response.data.context.question) {
            if (response.data.context.question.type === 'yn_question') {
              this.inputBoxEnabled = false
              this.$nextTick().then(() => {
                this.$store.commit('ADD_TEXT', {
                  type: 'yn_question',
                  action: response.data.context.question.action,
                  active: true,
                  options: response.data.context.question.options ? response.data.context.question.options : {yes: 'Sim', no: 'Não'}
                })
              })
              response.data.context.question.action === 'feedback' ? this.isFeedback = true : this.isFeedback = false
            }
          }
          if (response.data.context.apiOffline) {
            console.log('Ta off')
            this.submit({
              text: '',
              context: this.$store.getters.getContext
            }, true)
          }
          // Trigger when a silent and automatic verification is needed
          if (response.data.context.trigger) {
            this.submit({
              text: '',
              context: this.$store.getters.getContext
            }, true)
          }
        })
      })
      if (response.data.context.user) {
        this.newUser._id = response.data.context.user._id
        this.newUser.like = response.data.context.user.analysis
      }
      switch (response.data.context.selection_question) {
        case 'state-city': {
          this.$store.dispatch('LOAD_STATES').then(resp => {
            this.select1.items = this.states
            this.select1.active = true
            this.select1.noData = 'Selecione um estado'
            this.select1.icon = 'map'
            this.select1.isParent = true
            this.select1.origin = 'states'
            this.select1.item_value = 'nome'
            this.select1.item_text = 'nome'
            this.select1.multi = false
          }).catch(err => {
            console.log(err)
          })
          break
        }
        case 'skills':
          if (!this.skills) {
            this.adjustLocationByOppty()
            axios.get(this.axiosUrl + 'startup/', this.axiosConfig).then(resp => {
              this.$store.commit('SET_SKILLS', resp.data.skills)
              this.select1.items = this.skills
              this.select1.active = true
              this.select1.noData = 'Selecione uma ou mais habilidades'
              this.select1.icon = 'playlist_add'
              this.select1.isParent = false
              this.select1.origin = 'skills'
              this.select1.multi = true
              this.select1.model = []
              this.select1.item_value = 'name'
              this.select1.item_text = 'name'
              if (resp.data.causes) {
                this.$store.commit('SET_CAUSES', resp.data.causes)
              }
            }).catch(err => {
              console.log(err)
            })
          } else {
            this.setSelect(this.select1, {items: this.skills,
              active: true,
              noData: 'Selecione uma ou mais habilidades',
              icon: 'playlist_add',
              isParent: false,
              origin: 'skills',
              multi: true,
              model: [],
              item_value: 'name',
              item_text: 'name'})
          }
          break
        case 'causes':
          this.adjustLocationByOppty()
          axios.get(this.axiosUrl + 'startup/', this.axiosConfig).then(resp => {
            this.$store.commit('SET_CAUSES', resp.data.causes)
            this.select1.items = this.causes
            this.select1.active = true
            this.select1.noData = 'Selecione uma ou mais causas'
            this.select1.icon = 'map'
            this.select1.isParent = false
            this.select1.origin = 'causes'
            this.select1.multi = true
            this.select1.model = []
            this.select1.item_value = 'name'
            this.select1.item_text = 'name'
            if (resp.data.skills) {
              this.$store.commit('SET_SKILLS', resp.data.skills)
            }
          }).catch(err => {
            console.log(err)
          })
          break
        default:
          this.select1.active = false
          this.select2.active = false
          break
      }
    },
    submit (preset, avoid) {
      let data = null
      console.log('submit called')
      if (this.canSend || preset) {
        if (this.select1.active) {
          switch (this.select1.origin) {
            case 'states':
              if (!this.select2.model) {
                return false
              } else {
                if (this.$store.getters.getUser.login) {
                  let userData = this.$store.getters.getUser
                  userData.user_data.location = this.select2.model + ', ' + this.select1.model.nome
                  this.$store.commit('SET_USER', userData)
                  this.$store.commit('SET_CONTEXT', Object.assign(this.$store.getters.getContext, {userLocation: userData.user_data.location}))
                  // OBS: Salvar usuário
                } else {
                  this.newUser.location = this.select2.model + ', ' + this.select1.model.nome
                  this.$store.commit('SET_CONTEXT', Object.assign(this.$store.getters.getContext, {userLocation: this.newUser.location}))
                }
                this.select1.active = false
                this.select2.active = false
                data = {
                  text: this.message || this.select2.model + ', ' + this.select1.model.sigla,
                  context: this.$store.getters.getContext
                }
              }
              break
            case 'skills':
              this.$store.commit('SET_CONTEXT', Object.assign(this.$store.getters.getContext, {skills: this.select1.model}))
              data = {
                text: 'Tenho experiência com ' + this.select1.model.map(item => item.name).join(', '),
                context: this.$store.getters.getContext
              }
              this.select1.active = false
              break
            case 'causes':
              this.$store.commit('SET_CONTEXT', Object.assign(this.$store.getters.getContext, {causes: this.select1.model}))
              data = {
                text: 'As causas que mais me identifico são as de ' + this.select1.model.map(item => item.name).join(', '),
                context: this.$store.getters.getContext
              }
              this.select1.active = false
              break
          }
        } else {
          data = {
            text: preset && preset.text ? preset.text : this.message,
            context: preset && preset.context ? preset.context : this.$store.getters.getContext
          }
        }
        // avoidDisplay is for Automatic commands
        if (!avoid) {
          this.$store.commit('ADD_TEXT', {
            sender: 'user',
            message: data.text
          })
        }
        if (this.capturedDialog !== null) {
          this.newDialog = this.capturedDialog
          this.newDialog.messages.push({
            sender: 'user',
            message: data.text,
            feedback: this.feedback,
            isFeedback: this.isFeedback
          })
          this.$store.commit('SET_CAPTURED_DIALOG', this.newDialog)
        }
        this.$store.commit('ACTIVATE_TYPING')
        this.message = ''
        axios.get('/api/conversation/message', {
          params: data
        }).then(response => {
          this.processMessage(response)
        }).catch(err => {
          if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(err.response.data)
            console.log(err.response.status)
            console.log(err.response.headers)
          } else if (err.request) {
            // The request was made but no response was received
            // `err.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(err.request)
          } else {
            // Something happened in setting up the request that triggered an err
            console.log('err', err.message)
          }
          console.log(err.config)
        })
      } else {
        console.log('Cannot send')
      }
    },
    close () {
      this.$store.commit('TOGGLE_CHAT_VISIBILITY')
    },
    initChat () {
      return new Promise((resolve, reject) => {
        if (!this.$store.getters.getContext) {
          this.$store.commit('ACTIVATE_TYPING')
          axios.get('/api/conversation/init').then(response => {
            this.$store.commit('SET_CONTEXT', response.data.context)
            this.$store.commit('SET_TTS_TOKEN', response.data.ttsToken)
            this.$store.commit('SET_STT_TOKEN', response.data.sttToken)
            this.$store.dispatch('LOAD_STATES')
            Promise.all(response.data.output.text.map(text => {
              return this.synthesizeAndDisplay(text)
            })).then(values => {
              values.forEach(val => {
                val.audio.oncanplay = () => {
                  val.audio.play()
                  this.$store.commit('DEACTIVATE_TYPING')
                  this.$store.commit('ADD_TEXT', {
                    sender: 'watson',
                    message: val.text,
                    isPlaying: true
                  })
                }
                val.audio.onended = () => {
                  this.$store.commit('STOP_SPEECH_ANIMATION')
                  this.audio.src = null
                  resolve(true)
                }
              })
            })
            axios.post('/api/access_denied', {
              access_status: false
            })
          }).catch(err => {
            reject(err)
          })
        } else {
          // is user logged in?
          if (this.$store.getters.getUser.login) {
            resolve(true)
          } else {
            reject(false)
          }
        }
      })
    },
    notifyChatDeniedProfile () {
      let data = {
        text: 'sem acesso',
        context: this.$store.getters.getContext
      }
      this.$store.commit('ACTIVATE_TYPING')
      axios.get('/api/conversation/message', {
        params: data
      }).then(response => {
        this.$store.commit('DEACTIVATE_TYPING')
        this.$store.commit('SET_CONTEXT', response.data.context)
        response.data.output.text.forEach(text => {
          this.$store.commit('ADD_TEXT', {
            sender: 'watson',
            message: text
          })
        })
      })
    },
    openLink (link) {
      window.open(link, '_blank')
    },
    saveProfile () {
      let user = {
        name: this.newUser.name,
        email: this.newUser.email,
        pwd: this.newUser.pwd,
        like: this.newUser.like,
        location: this.newUser.location
      }
      axios.post('/api/profile/save', user).then(() => {
        this.error = false
        this.$store.dispatch('LOGIN').then(() => {
          this.displayLoginBox = false
          this.inputBoxEnabled = true
          let data = {
            text: 'Perfil salvo',
            context: Object.assign(this.$store.getters.getContext, {userLocation: this.$store.getters.getUser.user_data.location})
          }
          console.log(data)
          this.$store.commit('ACTIVATE_TYPING')
          axios.get('/api/conversation/message', {
            params: data
          }).then(response => {
            this.$store.commit('DEACTIVATE_TYPING')
            this.processMessage(response)
          })
        })
      }).catch(err => {
        console.log(err)
        if (err.response) {
          if (err.response.status === 403) {
            this.error.message = 'Email ja está em uso!'
          }
        } else if (err.request) {
          console.log(err.request)
        } else {
          console.log('err', err.message)
        }
      })
    },
    /**
     * Synthesize a text. If it fails to synthesize
     *
     * @param {String} text
     * @public
     */
    synthesizeAndDisplay (text) {
      return new Promise((resolve, reject) => {
        let token = this.$store.getters.getTTSToken
        this.tts = new WebSocket('wss://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?voice=pt-BR_IsabelaVoice&watson-token=' + token)
        this.tts.onmessage = (evt) => {
          if (typeof evt.data === 'string') {
            console.log('Received string message: ', evt.data)
          } else {
            this.ttsAudioStream.push(evt.data)
          }
        }
        this.tts.onclose = (evt) => {
          console.log('WebSocket closed', evt.code, evt.reason)
          let currentAudioBlob = new Blob(this.ttsAudioStream, {type: 'audio/wav'})
          this.audio.src = (URL.createObjectURL(currentAudioBlob))
          this.ttsAudioStream.length = 0
          this.audio.load()
          this.audio.play()
        }
        this.tts.onopen = (evt) => {
          console.log('Socket open')
          this.tts.send(JSON.stringify({text: text, accept: 'audio/mp3'}))
        }
        resolve({ audio: this.audio, text })
      })
    }
  },
  mounted () {
    this.$nextTick().then(() => {
      document.querySelector('.chat-wrapper').scrollIntoView({
        behavior: 'smooth'
      })
      this.audio = document.getElementById('audio') || new Audio()
      this.initChat().then(res => {
        if (this.$store.getters.getUser.login) {
          if (this.isDenied) {
            // this.notifyChatDeniedProfile()
            this.submit({text: 'sem acesso'}, true)
          } else {
            // this.notifySocialMedia()
            this.submit({
              text: this.$store.getters.getAccessSource + ' Access',
              context: Object.assign(this.$store.getters.getContext, {video_query: this.$store.getters.getUser.user_data.like})
            }, true)
          }
        } else {
          console.log(this.gettingProfile === undefined)
          if (this.gettingProfile) {
            console.log('This is america')
            this.submit({
              text: '',
              context: Object.assign(this.$store.getters.getContext, {gettingProfile: 'started'})
            }, true)
          } else {
            this.submit({text: 'Primeiro acesso'}, true)
          }
        }
      }).catch(err => {
        console.log(err)
        if (this.$store.getters.getContext.gettingProfile === 'started') {
          this.submit({
            text: '',
            context: this.$store.getters.getContext
          }, true)
        }
      })
    })
  },
  updated () {
    document.querySelector('.chat-wrapper').scrollIntoView({
      behavior: 'smooth'
    })
  }
}
</script>
<style lang="sass">
  @import 'Chat'
</style>
