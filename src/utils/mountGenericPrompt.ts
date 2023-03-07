interface MountGenericPromptProps {
  emojis: boolean;
  hashtags: boolean;
  lowerCase: boolean;
  amount: number;
}

const mountGenericPrompt = (reviewRequested: MountGenericPromptProps) => {
  return `
      I want you to generate generic positive and glowing casual social media-style product reviews. Please use the following details:
  
      Number of reviews: ${reviewRequested.amount}
      Include Emojis flag: ${reviewRequested.emojis ? "yes" : "no"}
      Include Hashtags flag: ${reviewRequested.hashtags ? "yes" : "no"}
  
      The task is to create the specified number of reviews being generic about the product 
      that it is being reviewed. For example, you could mention your satisfaction on the 
      shipping time, overall quality of the product, customer support and so on. The reviews 
      should be brief, sound like they were written by real people using casual language, 
      and not perfect English. You can also vary the length of the reviews and make them 
      sound like they were written by different people (e.g. an 18-year-old male, 
      a 40-year-old female, or a 75-year-old woman). If the Include Emojis flag is set 
      to yes, then the reviews should include appropriate emojis. If the Include Emojis 
      flag is set to no, then the reviews should not include emojis. If the Include 
      Hashtags flag is set to yes, then the reviews should include appropriate hashtags. 
      Give me the answer in the following 
      JSON format: { "reviews": [<review: string>, <review: string>,<review: string>] }. 
      Please only respond with the JSON, without any additional 
      explanations or words.
    `;
};

export default mountGenericPrompt;
