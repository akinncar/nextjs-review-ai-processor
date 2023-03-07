interface MountSpecificPromptProps {
  productDescription: string;
  emojis: boolean;
  hashtags: boolean;
  lowerCase: boolean;
  amount: number;
}

const mountSpecificPrompt = (reviewRequested: MountSpecificPromptProps) => {
  return `
    I want you to generate generic positive and glowing casual social media-style product reviews. Please use the following details:

    Product name or key features: ${reviewRequested.productDescription}
    Number of reviews: ${reviewRequested.amount}
    Include Emojis flag: ${reviewRequested.emojis ? "yes" : "no"}
    Include Hashtags flag: ${reviewRequested.hashtags ? "yes" : "no"}

    The task is to create the specified number of reviews that highlight
    the product's strongest points and benefits. The reviews should be
    brief, sound like they were written by real people using casual 
    language, and not perfect English, and you also need to not 
    capitalize any word and not use punctuation. You can also vary 
    the length of the reviews and make them sound like they were 
    written by different people (e.g. an 18-year-old male, a 
    40-year-old female, or a 75-year-old woman). You should NOT mention
    the name of the product on the reviews. If the Include Emojis flag 
    is set to yes, then the reviews should include appropriate emojis. 
    If the Include Emojis flag is set to no, then the reviews should not 
    include emojis. If the Include Hashtags flag is set to yes, then the 
    reviews should include appropriate hashtags. If the Include Hashtags 
    flag is set to no, then the reviews should not include hashtags. 
    Give me the answer in the following 
    JSON format: { "reviews": [<review: string>, <review: string>,<review: string>] }. 
    Please only respond with the JSON, without any additional 
    explanations or words.
  `;
};

export default mountSpecificPrompt;
