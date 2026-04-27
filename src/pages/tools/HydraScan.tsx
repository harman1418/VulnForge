import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const HydraScan = () => (
  <GenericTool config={SECURITY_TOOLS.password_auditor} toolType="hydra" />
);
export default HydraScan;
