import { combineReducers } from 'redux';
import jackets from './jackets';
import defaults from './defaults';
import globals from './globals';
import pricing from './pricing';
import styles from './styles';
import materials from './materials';
import colors from './colors';
import designs from './designs';
import sizes from './sizes';
import popup from './modal';
import guideModal from './guides';
import advance from './advance';

export default combineReducers({
  defaults,
  jackets,
  globals,
  styles,
  materials,
  colors,
  designs,
  sizes,
  popup,
  guideModal,
  pricing,
  advance,
});
