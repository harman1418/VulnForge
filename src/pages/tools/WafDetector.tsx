import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

export const WafDetector = () => (
  <GenericTool config={SECURITY_TOOLS.waf_detector} toolType="waf" />
);
export default WafDetector;
