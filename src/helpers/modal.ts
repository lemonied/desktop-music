import { Modal as AntdModal, message } from 'antd';
import { ModalFunc } from 'antd/lib/modal/confirm';
import { ReactNode } from 'react';
import { MessageType } from 'antd/es/message';
interface ModalTypes {
  info: ModalFunc;
  success: ModalFunc;
  error: ModalFunc;
  warn: ModalFunc;
  warning: ModalFunc;
  confirm: ModalFunc;
}
const defaultConfig = {
  centered: true
};
const Modal: ModalTypes = {
  info(props): any {
    return AntdModal.info(Object.assign(props, defaultConfig));
  },
  success(props): any {
    return AntdModal.success(Object.assign(props, defaultConfig));
  },
  error(props): any {
    return AntdModal.error(Object.assign(props, defaultConfig));
  },
  warn(props): any {
    return AntdModal.warn(Object.assign(props, defaultConfig));
  },
  warning(props): any {
    return AntdModal.warning(Object.assign(props, defaultConfig));
  },
  confirm(props): any {
    return AntdModal.confirm(Object.assign(props, defaultConfig));
  }
} as ModalTypes;

export { Modal };

const Message = {
  toast(content: ReactNode, duration = 3): MessageType {
    return message.open({
      type: 'info',
      icon: null,
      content,
      duration
    });
  }
};
export { Message };
