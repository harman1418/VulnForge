import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const SubdomainFinder = () => (
  <GenericTool config={SECURITY_TOOLS.subdomain_finder} toolType="subdomain" />
);
export default SubdomainFinder;
