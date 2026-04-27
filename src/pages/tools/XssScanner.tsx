import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const XssScanner = () => (
  <GenericTool config={SECURITY_TOOLS.xss_scanner} toolType="xss" />
);
export default XssScanner;
