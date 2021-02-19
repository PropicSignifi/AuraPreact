const getLabel = (key, defaultLabel) => {
    const label = $A.get(`$Label.c.${key}`);
    return label || defaultLabel;
};

const I18N = {
    getLabel,
};

export default I18N;
