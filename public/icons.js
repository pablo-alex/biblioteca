import Search from './assets/icons/search.mjs';
import ArrowRight from './assets/icons/arrow-right.mjs';
import BookOpen from './assets/icons/book-open.mjs';
import MapPin from './assets/icons/map-pin.mjs';
import LogIn from './assets/icons/log-in.mjs';
import LayoutDashboard from './assets/icons/layout-dashboard.mjs';
import LibraryBig from './assets/icons/library-big.mjs';
import Users from './assets/icons/users.mjs';
import BookCopy from './assets/icons/book-copy.mjs';
import Undo2 from './assets/icons/undo-2.mjs';
import Plus from './assets/icons/plus.mjs';
import Pencil from './assets/icons/pencil.mjs';
import CircleCheck from './assets/icons/circle-check.mjs';
import TriangleAlert from './assets/icons/triangle-alert.mjs';
import LogOut from './assets/icons/log-out.mjs';
import RefreshCw from './assets/icons/refresh-cw.mjs';
import CalendarDays from './assets/icons/calendar-days.mjs';
import UserRoundSearch from './assets/icons/user-round-search.mjs';
import BookOpenCheck from './assets/icons/book-open-check.mjs';
import ChevronDown from './assets/icons/chevron-down.mjs';
import ChevronRight from './assets/icons/chevron-right.mjs';
import Upload from './assets/icons/upload.mjs';
import X from './assets/icons/x.mjs';
import Menu from './assets/icons/menu.mjs';
import Filter from './assets/icons/filter.mjs';
import Clock3 from './assets/icons/clock-3.mjs';

export const icons = {
  search: Search,
  arrowRight: ArrowRight,
  bookOpen: BookOpen,
  mapPin: MapPin,
  logIn: LogIn,
  dashboard: LayoutDashboard,
  library: LibraryBig,
  users: Users,
  loans: BookCopy,
  return: Undo2,
  plus: Plus,
  edit: Pencil,
  success: CircleCheck,
  warning: TriangleAlert,
  logOut: LogOut,
  refresh: RefreshCw,
  calendar: CalendarDays,
  userSearch: UserRoundSearch,
  bookAvailable: BookOpenCheck,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  upload: Upload,
  close: X,
  menu: Menu,
  filter: Filter,
  clock: Clock3,
};

export function icon(name, className = 'icon') {
  return (icons[name] || '').replace('<svg', `<svg class="${className}" aria-hidden="true"`);
}
