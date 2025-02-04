import { ProtoAction } from './protoAction';

export interface AnchorPointAction extends ProtoAction {
  getAction: () => void;
}
