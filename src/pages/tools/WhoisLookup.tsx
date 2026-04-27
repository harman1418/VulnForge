import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const WhoisLookup = () => (
  <GenericTool config={SECURITY_TOOLS.whois_lookup} toolType="whois" />
);
export default WhoisLookup;
