import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const SqliScanner = () => (
  <GenericTool config={SECURITY_TOOLS.sqli_scanner} toolType="sqli" />
);
export default SqliScanner;
