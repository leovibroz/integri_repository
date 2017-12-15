export default {
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
  }
}
