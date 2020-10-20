import React, {
  createRef,
  FC,
  forwardRef,
  ForwardRefRenderFunction,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import ReactDOM from 'react-dom';
import { combineClassNames } from '../../helpers/utils';
import './style.scss';

const DefaultAppend: FC<{percent: number;}> = function(props) {
  const { percent = 0 } = props;
  return (
    <Fragment>{percent} %</Fragment>
  );
};

interface ProgressProps {
  percent: number;
  className?: string;
  trailColor?: string;
  color?: string;
  progress?: ProgressInstance;
}
interface ProgressInstance {
  setPercent: (percent?: number) => void;
}
export const useProgress = (): ProgressInstance => {
  const instance = useRef<ProgressInstance>({} as ProgressInstance);
  return instance.current;
};
interface CircleProgressProps extends ProgressProps {
  type?: 'circle';
  middle?: ReactNode;
}
const CircleProgressFc: ForwardRefRenderFunction<ProgressInstance, CircleProgressProps> = function(props, ref) {
  const { percent, middle, className, trailColor, color, progress } = props;

  const [ realPercent, setRealPercent ] = useState<number>(percent);

  const instance = useMemo<ProgressInstance>(() => {
    return {
      setPercent: (percent?: number) => {
        setRealPercent(percent || 0);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof progress === 'object') {
      Object.assign(progress, instance);
    }
  }, [progress, instance]);

  useEffect(() => {
    setRealPercent(percent);
  }, [percent]);

  useImperativeHandle(ref, () => {
    return instance;
  });

  return (
    <div className={combineClassNames('windy-circle-progress', className)}>
      <svg className="circle-progress" viewBox="0 0 100 100">
        <path
          style={{ strokeDasharray: `${94 * 3.14}px, ${94 * 3.14}px` }}
          className="circle-trail"
          d="M 50,50 m 0,-47a 47,47 0 1 1 0,94a 47,47 0 1 1 0,-94"
          strokeLinecap="round"
          strokeWidth="6"
          fillOpacity="0"
          stroke={trailColor}
        />
        <path
          style={{ strokeDasharray: `${94 * realPercent / 100 * 3.14}px, ${94 * 3.14}px` }}
          className="circle-path"
          d="M 50,50 m 0,-47a 47,47 0 1 1 0,94a 47,47 0 1 1 0,-94"
          strokeLinecap="round"
          strokeWidth="6"
          opacity="1"
          fillOpacity="0"
          stroke={color}
        />
      </svg>
      {
        typeof middle === 'undefined' ?
          <div className={'windy-circle-progress-middle'}>
            <DefaultAppend percent={realPercent} />
          </div> :
          middle !== null ?
            <div className={'windy-circle-progress-middle'}>{middle}</div> :
            null
      }
    </div>
  );
};

export const CircleProgress = forwardRef(CircleProgressFc);

interface LineProgressProps extends ProgressProps {
  type?: 'line';
  after?: ReactNode;
  height?: number;
  dot?: boolean;
  onChange?: (percent: number) => void;
}
const LineProgressFc: ForwardRefRenderFunction<ProgressInstance, LineProgressProps> = function (props, ref) {
  const { percent = 0, after, height = 5, className, trailColor, color, onChange, progress, dot = true } = props;

  const [ realPercent, setRealPercent ] = useState<number>(0);
  const [ slow, setSlow ] = useState<boolean>(true);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef({
    isMove: false,
    status: false,
    offset: 0
  });

  const instance = useMemo<ProgressInstance>(() => {
    return {
      setPercent(percent?: number) {
        setRealPercent(percent || 0);
      }
    };
  }, []);
  useImperativeHandle(ref, () => {
    return instance;
  });
  useEffect(() => {
    if (typeof progress === 'object') {
      Object.assign(progress, instance);
    }
  }, [instance, progress]);

  useEffect(() => {
    if (touchRef.current.isMove) {
      return;
    }
    setRealPercent(percent);
  }, [percent]);

  const handleChange = useCallback((percent: number) => {
    if (typeof onChange === 'function') {
      onChange(Math.floor(percent * 100));
    }
  }, [onChange]);

  const touchStart = useCallback((e: React.TouchEvent) => {
    if (!dot) { return; }
    e.preventDefault();
    e.stopPropagation();
    setSlow(false);
    touchRef.current.status = true;
  }, [dot]);
  const touchMove = useCallback((e: React.TouchEvent) => {
    if (!dot) { return; }
    e.preventDefault();
    e.stopPropagation();
    if (!touchRef.current.status) {
      return;
    }
    touchRef.current.isMove = true;
    const barWidth = progressBarRef.current?.clientWidth || 0;
    const offset = touchRef.current.offset = Math.min(e.touches[0].pageX - (progressBarRef.current?.offsetLeft || 0), barWidth);
    setRealPercent(offset / barWidth * 100);
  }, [dot]);
  const touchEnd = useCallback((e: React.TouchEvent) => {
    if (!dot) { return; }
    e.preventDefault();
    e.stopPropagation();
    const barWidth = progressBarRef.current?.clientWidth || 0;
    if (!touchRef.current.isMove) {
      return;
    }
    touchRef.current.status = false;
    touchRef.current.isMove = false;
    handleChange(touchRef.current.offset / barWidth);
    setSlow(true);
  }, [handleChange, dot]);
  const progressClick = useCallback((e: React.MouseEvent) => {
    if (!dot) { return; }
    e.preventDefault();
    const barWidth = progressBarRef.current?.clientWidth || 0;
    const offset = touchRef.current.offset = e.pageX - (progressBarRef.current?.offsetLeft || 0);
    setRealPercent(offset / barWidth * 100);
    handleChange(touchRef.current.offset / barWidth);
  }, [handleChange, dot]);

  return (
    <div
      className={combineClassNames('windy-progress-outer', className)}
      onTouchStart={touchStart}
      onTouchMove={touchMove}
      onTouchEnd={touchEnd}
      onClick={progressClick}
    >
      <div
        className={'windy-progress-inner'}
        style={{height, backgroundColor: trailColor}}
        ref={progressBarRef}
      >
        <div
          className={combineClassNames('windy-progress-bg', slow ? 'slow' : null)}
          style={{width: `${realPercent}%`, backgroundColor: color}}
        >
          {
            dot ?
              <div className={'progress-btn-wrapper'}>
                <div className="progress-btn" />
                <div className="progress-btn-circle" />
              </div> :
              null
          }
        </div>
      </div>
      {
        typeof after === 'undefined' ?
          <div className={'windy-progress-after'}>
            <DefaultAppend percent={percent} />
          </div> :
          after
      }

    </div>
  );
};
export const LineProgress = forwardRef(LineProgressFc);

interface ProgressServiceOptions {
  defaultPercent?: number;
  height?: number;
}
export class ProgressService {
  ele: Element | null = null;
  instance = createRef<ProgressInstance>();

  // 1 ~ 100
  set(percent: number) {
    this.instance.current?.setPercent(percent);
  }
  open(options: ProgressServiceOptions = {}) {
    const { defaultPercent = 0, height = 2 } = options;
    this.destroy();
    const container = document.createElement('div');
    container.className = 'progress-container';
    document.body.appendChild(container);
    ReactDOM.render(
      <LineProgress percent={0} ref={this.instance} after={null} height={height} dot={false} />,
      container,
      () => setTimeout(() => this.set(defaultPercent))
    );
    this.ele = container;
  }
  destroy() {
    if (this.ele) {
      ReactDOM.unmountComponentAtNode(this.ele);
      this.ele.remove();
    }
  }
}

export const progressBar = new ProgressService();
