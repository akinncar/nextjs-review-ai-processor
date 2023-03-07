interface MountSpecificPromptProps {
  productDescription: string;
  emojis: boolean;
  hashtags: boolean;
  lowerCase: boolean;
  amount: number;
}

const includeEmojis = "You should include emojis in the reviews.";
const includeHashtags = "You should include hashtags in the reviews.";
const lowercase = "You should use lowercase the reviews.";

const mountSpecificPrompt = (reviewRequested: MountSpecificPromptProps) => {
  console.log(
    reviewRequested.emojis,
    reviewRequested.hashtags,
    reviewRequested.lowerCase
  );
  return `
    I want you to generate generic positive and glowing casual social media-style product reviews. Please use the following details:

    Product name or key features: ${reviewRequested.productDescription}
    Number of reviews: ${reviewRequested.amount}

    The task is to create the specified number of reviews that highlight
    the product's strongest points and benefits without mentioning the name
    of the product (e.g 'Coolgate Tooth Paste', you can mention tooth paste, but not colgate).
    The reviews should be
    brief, sound like they were written by real people using casual 
    language, and not perfect English. You can also vary 
    the length of the reviews and make them sound like they were 
    written by different people (e.g. an 18-year-old male, a 
    40-year-old female, or a 75-year-old woman). ${
      reviewRequested.emojis ? includeEmojis : ""
    }${reviewRequested.hashtags ? includeHashtags : ""}${
    reviewRequested.lowerCase ? lowercase : ""
  }
    Give me the answer in the following 
    JSON format: { "reviews": [<review: string>, <review: string>,<review: string>] }. 
    Please only respond with the JSON, without any additional 
    explanations or words.
  `;
};

export default mountSpecificPrompt;
