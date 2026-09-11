update menu_categories set sort_order = case slug
  when 'bevande-e-birre' then 1
  when 'antipasti' then 2
  when 'tempure-fritti-con-japan-panko-4-pz' then 3
  when 'creazioni-ramiro-reinoso-4-pz' then 4
  when 'sashimi-4pz' then 5
  when 'nigiri-1pz' then 6
  when 'gunkan-1pz' then 7
  when 'hosomaki-6pz' then 8
  when 'uramaki-8pz' then 9
  when 'gluten-free' then 10
  when 'tartare' then 11
  when 'cucina' then 12
  when 'dolci-e-digestivi' then 13
  when 'cocktail' then 14
  when 'vino-bianco' then 15
  when 'bollicine' then 16
  when 'fine-pasto' then 17
  when 'vini-rosati' then 18
  when 'vino-rosso' then 19
  else sort_order
end;
