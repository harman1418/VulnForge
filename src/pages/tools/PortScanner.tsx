import { GenericTool } from '@components/GenericTool';
import { SECURITY_TOOLS } from '@/config/constants';

/**
 * Port Scanner Page
 * Nmap-based comprehensive port scanning
 */
export const PortScanner = () => (
  <GenericTool
    config={SECURITY_TOOLS.port_scanner}
    toolType="port"
  />
);

export default PortScanner;
