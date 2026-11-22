import './styles.css';
import { mountArcade } from './arcade-renderer';

mountArcade(document.querySelector<HTMLDivElement>('#app')!);
