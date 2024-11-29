export enum BlockParameterSource {
  CONSTANT = 'constant', // value is hardcoded
  USER_DEFINED = 'user_defined', // user input
  HTTP_REQUEST = 'http_request', // result of a request
  AI_REQUEST = 'ai_request', // result of a prompt
  CONTACT_METADATA = 'contact_metadata', // first name, last name, etc.
  SYSTEM = 'system', // date, hours, etc.
  ARTICLE = 'article', // article content
}
