const stripHtml = (value = '') => (
  String(value)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const isHtml = (value = '') => /<\/?[a-z][\s\S]*>/i.test(String(value));

const sanitizeHtml = (value = '') => {
  let output = String(value);
  output = output.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  output = output.replace(/\son\w+="[^"]*"/gi, '');
  output = output.replace(/\son\w+='[^']*'/gi, '');
  output = output.replace(/\son\w+=\S+/gi, '');
  output = output.replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');
  return output;
};

export { stripHtml, isHtml, sanitizeHtml };
