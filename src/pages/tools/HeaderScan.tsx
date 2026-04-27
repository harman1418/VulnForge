import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const HeaderScan = () => (
  <GenericTool config={SECURITY_TOOLS.header_scanner} toolType="header" />
);
export default HeaderScan;
