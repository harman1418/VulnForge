import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const GobusterScan = () => (
  <GenericTool config={SECURITY_TOOLS.url_fuzzer} toolType="gobuster" />
);
export default GobusterScan;
