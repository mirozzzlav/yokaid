import MapRoutes from 'src/routes/Map';
import ContactRoutes from 'src/routes/Contact';
import TermsAndConditionsRoutes from 'src/routes/TermsAndConditions';

const routes = [...MapRoutes, ...TermsAndConditionsRoutes, ...ContactRoutes];
export default routes;
