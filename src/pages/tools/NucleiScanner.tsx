import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const NucleiScanner = () => (
  <GenericTool config={SECURITY_TOOLS.cve_scanner} toolType="nuclei" />
);
export default NucleiScanner;
