import type { InstanceEvent } from "../../shared/constants.js";

export interface InstanceStatus {
  readonly connected: boolean;
  readonly loggedIn: boolean;
  readonly name: string;
}

export interface ConnectInput {
  readonly phone?: string;
  readonly webhookUrl?: string;
  readonly subscribe?: readonly InstanceEvent[];
}

export interface QrCode {
  readonly imageSrc: string | null;
  readonly code: string | null;
  readonly passkeyStage: string | null;
  readonly passkeyOpenUrl: string | null;
  readonly passkeyCode: string | null;
}

export interface PairInput {
  readonly phone: string;
}

export interface PairingResult {
  readonly pairingCode: string;
}

export interface EvolutionClient {
  getStatus(token: string): Promise<InstanceStatus>;
  connect(token: string, input: ConnectInput): Promise<void>;
  getQr(token: string): Promise<QrCode>;
  pair(token: string, input: PairInput): Promise<PairingResult>;
  reconnect(token: string): Promise<void>;
  disconnect(token: string): Promise<void>;
}
