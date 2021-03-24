// @ts-check

let id = 1000;

export const nextId = () => {
  id += 1;
  return id;
};

export const validate = ({ name, phone }) => {
  const errors = [];
  const presenceMessage = "can't be blank";

  if (!name) errors.push({ source: 'name', title: presenceMessage });
  else if (!name.match(/^[\w.]+$/)) errors.push({ source: 'name', title: 'bad format' });
  if (!phone) errors.push({ source: 'phone', title: presenceMessage });
  return errors;
};
