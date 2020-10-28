import React, {
  forwardRef,
  ForwardRefRenderFunction, MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { combineClassNames } from '../../helpers/utils';
import { CSSTransition } from 'react-transition-group';
import './style.scss';

interface ProgressProps {
  percent: number;
  className?: string;
  dot?: ReactNode;
  wrapper?: MutableRefObject<any>;
  onChange?: (percent: number) => void;
  progress?: ProgressInstance;
}
interface ProgressInstance {
  setPercent: (percent?: number) => void;
}
export const useProgress = (): ProgressInstance => {
  const instance = useRef<ProgressInstance>({} as ProgressInstance);
  return instance.current;
};
const LineProgressFc: ForwardRefRenderFunction<ProgressInstance, ProgressProps> = function (props, ref) {
  const { percent = 0, className, onChange, progress, dot, wrapper } = props;

  const [ realPercent, setRealPercent ] = useState<number>(0);
  const [ slow, setSlow ] = useState<boolean>(true);
  const [ active, setActive ] = useState<boolean>(false);

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

  const mouseDown = useCallback((e: React.MouseEvent) => {
    if (dot === null) { return; }
    e.preventDefault();
    e.stopPropagation();
    setSlow(false);
    touchRef.current.status = true;
    const barWidth = progressBarRef.current?.clientWidth || 0;
    const offset = touchRef.current.offset = Math.min(e.pageX - (progressBarRef.current?.offsetLeft || 0), barWidth);
    setRealPercent(offset / barWidth * 100);
  }, [dot]);
  const mouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (dot === null) { return; }
    if (!touchRef.current.status) {
      return;
    }
    touchRef.current.isMove = true;
    const barWidth = progressBarRef.current?.clientWidth || 0;
    const offset = touchRef.current.offset = Math.min(e.pageX - (progressBarRef.current?.offsetLeft || 0), barWidth);
    setRealPercent(offset / barWidth * 100);
  }, [dot]);
  const mouseUp = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (dot === null) { return; }
    const barWidth = progressBarRef.current?.clientWidth || 0;
    if (!touchRef.current.status) {
      return;
    }
    touchRef.current.status = false;
    touchRef.current.isMove = false;
    handleChange(touchRef.current.offset / barWidth);
    setSlow(true);
  }, [handleChange, dot]);

  const onMouseEnter = useCallback(() => {
    setActive(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setActive(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', mouseUp);
    return () => {
      document.removeEventListener('mouseup', mouseUp);
    };
  }, [mouseUp]);
  useEffect(() => {
    document.addEventListener('mousemove', mouseMove);
    return () => {
      document.removeEventListener('mousemove', mouseMove);
    };
  }, [mouseMove]);
  useEffect(() => {
    const miniPlayer = wrapper?.current;
    if (!miniPlayer) { return; }
    miniPlayer.addEventListener('mouseenter', onMouseEnter);
    miniPlayer.addEventListener('mouseleave', onMouseLeave);
    return () => {
      miniPlayer.removeEventListener('mouseenter', onMouseEnter);
      miniPlayer.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [onMouseEnter, onMouseLeave, wrapper]);

  return (
    <div
      className={combineClassNames('windy-progress-outer', className)}
      onMouseDown={mouseDown}
    >
      <div
        className={'windy-progress-inner'}
        ref={progressBarRef}
      >
        <div
          className={combineClassNames('windy-progress-bg', slow ? 'slow' : null)}
          style={{width: `${realPercent}%`}}
        >
          <CSSTransition
            timeout={300}
            classNames={'scale'}
            in={active}
            unmountOnExit
          >
            {
              typeof dot === 'undefined' ?
                <div className={'progress-btn-wrapper'}>
                  <div className="progress-btn" />
                  <div className="progress-btn-circle" />
                </div> :
                dot
            }
          </CSSTransition>
        </div>
      </div>
    </div>
  );
};
export const LineProgress = forwardRef(LineProgressFc);
