import createStore from '../redux/createStore'
import reducers from './reducers'
let store = createStore(reducers)
window.store = store
export default store