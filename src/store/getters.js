export default {
  getDrawer: state => {
    return state.drawer
  },
  getUser: state => {
    return state.user
  },
  getTrends: state => {
    return state.trends
  },
  getRelevant: state => {
    return state.relevant
  },
  displayLabel: state => {
    return state.displayLabel
  },
  displayChat: state => {
    return state.displayChat
  },
  getContext: state => {
    return state.context
  },
  getChat: state => {
    return state.chat
  },
  getPolicy: state => {
    return state.policy
  },
  getPlayerStatus: state => {
    return state.player_active
  },
  getCurrentVideo: state => {
    return state.current_video
  },
  getUsageTerms: state => {
    return state.usage_terms
  },
  isTyping: state => {
    return state.typing
  },
  getStatesCities: state => {
    return state.states_cities
  },
  getCauses: state => {
    return state.causes
  },
  getSkills: state => {
    return state.skills
  },
  getAccessSource: state => {
    return state.access_source
  },
  getOpportunities: state => {
    return state.opportunities
  },
  getCapturedDialog: state => {
    return state.captured_dialog
  },
  getClassificationTags: state => {
    return state.classification_tags
  },
  getClassificationTagName: state => (id) => {
    return state.classification_tags.find(tag => tag.id === id).name
  },
  getContentVideos: state => {
    return state.content_videos
  },
  getContentTexts: state => {
    return state.content_texts
  },
  getSpecificText: state => {
    return state.current_text
  },
  getCurrentDialog: state => {
    return state.current_dialog
  },
  getUnseenDialogs: state => {
    return state.unseen_dialogs
  },
  getPendingDialogs: state => {
    return state.pending_dialogs
  },
  getFinishedDialogs: state => {
    return state.finished_dialogs
  },
  getLoginReturn: state => {
    return state.login_return
  },
  getDashboardFeatures: state => {
    return state.dashboard_features
  },
  getDashboardSelectedFeatures: state => {
    return state.dashboard_selected_feature
  },
  getNewsletterSubscribers: state => {
    return state.dashboard_newsletter_subscribers
  },
  getDashboardContentList: state => {
    return state.dashboard_content
  },
  getDashboardSharedContentList: state => {
    return state.dashboard_shared_content
  },
  getDashboardUsers: state => {
    return state.dashboard_users
  },
  getTTSToken: state => {
    return state.tts_token
  },
  getTTSWSConnectionState: state => {
    return state.ttsWebSocketOpen
  },
  getSTTToken: state => {
    return state.stt_token
  },
  getSTTWSConnectionState: state => {
    return state.sttWebSocketOpen
  },
  isLeviGettingProfile: state => {
    return state.getProfileIntention
  }
}
