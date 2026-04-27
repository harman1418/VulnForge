import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const WpScanner = () => (
  <GenericTool config={SECURITY_TOOLS.wordpress_scanner} toolType="wordpress" />
);
export default WpScanner;
