import { Observable } from 'rxjs';

// Validate a value, return Observable.empty() if target is invalid
// safe :: (a -> Boolean) -> a -> Observable a
export const safe = _.curry(
    (pred, target) => (
        Observable.of(target)
            .filter(pred)
    )
);

// Get the prop of an object, return Observable.empty() if prop is undefined
// safeProp :: String -> a -> Observable b
export const safeProp = _.curry(
    (propName, target) => safe(v => !_.isNil(v), _.get(target, propName))
);

// Get the path of an object, return Observable.empty() if path is undefined
// safePath :: [String] -> a -> Observable b
export const safePath = _.curry(
    (path, target) => safe(v => !_.isNil(v), _.get(target, path))
);

// Validate a before invoking fn and return an Observable as Maybe
// safeBefore :: (a -> Boolean) -> (a -> b) -> a -> Observable b
export const safeBefore = _.curry(
    (pred, fn, a) => (
        safe(pred, a)
            .map(fn)
    )
);

// Validate result after invoking fn and return an Observable as Maybe
// safeAfter :: (a -> Boolean) -> (a -> b) -> a -> Observable b
export const safeAfter = _.curry(
    (pred, fn, a) => safe(pred, fn(a))
);
