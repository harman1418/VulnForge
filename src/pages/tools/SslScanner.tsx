import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const SslScanner = () => (
  <GenericTool config={SECURITY_TOOLS.ssl_scanner} toolType="ssl" />
);
export default SslScanner;
