/**
 * Blog Seed Script - Migrates ALL existing blog posts from external blog
 * Run with: node seeds/blogSeed.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/blogs.js';

dotenv.config();

const blogs = [
    // ========== PAGE 1 BLOGS ==========
    {
        title: "Tips and Ideas for Effortlessly Styling Women's Hoodies",
        slug: "tips-and-ideas-for-effortlessly-styling-womens-hoodies",
        content: `
      <p>Discover ultimate comfort and style with EasyJacket's collection of women hoodies. Keep reading to explore fantastic styling ideas.</p>
      
      <h2>Style 1: Relaxed and Effortlessly Chic Hoodies for Women</h2>
      <p>Ladies, get ready to be inspired! This first look demonstrates how to effortlessly pair a hoodie with a suit for a look that's both cozy and preppy. Combining a casual hoodie with a tailored suit creates a striking contrast that's unexpectedly stylish, blending two different styles into one chic ensemble.</p>
      <p>First and foremost, don't shy away from bold choices. Kick off your look with a pastel hoodie and layer it under a striking, colorful suit featuring flared pants. Opt for vibrant shades like red, blue, or yellow and embrace the fun. Take a cue from Hailey Bieber by completing the ensemble with white sneakers, chic black sunglasses, and a small stylish bag, then strut confidently through the city as if you're on your own runway.</p>
      
      <h2>Style 2: A Bold Fusion of Edgy and Playful Styles</h2>
      <p>Ding-Ding! Guess what time it is? Time to ditch that good girl persona and unleash your inner rebel. This second look elevates a simple hoodie by combining it with a punk-inspired element, creating a bold ensemble that embodies feminine strength, defiance, and daring attitude.</p>
      <p>Begin with a classic black or white hoodie and tuck it into a plaid skirt to achieve that ideal punk-inspired vibe. But don't stop there—step up the look with chunky boots, black sunglasses, and don your fiercest "my life, my rules" attitude. And just like that, you're all set for an effortlessly edgy style.</p>
      
      <h2>Style 3: The Definitive Streetwear Look – Hoodies for Women</h2>
      <p>Throughout history and across cultures, the hoodie has consistently embodied the sleek, urban essence of modern street fashion. In this look, we celebrate the hoodie's origins by returning it to its street style roots, showcasing its timeless appeal in contemporary urban attire.</p>
      <p>Choose any hoodie you like and elevate your look by teaming it with faux leather pants. This combination offers a perfect balance—sporty and relaxed on top, yet chic and edgy on the bottom. The leather pants introduce a touch of sophistication and boldness, while the hoodie keeps the ensemble casual and effortless. For an added touch of drama, finish the outfit with a pair of sleek black stilettos to make a striking statement.</p>
      
      <h2>Style 4: A Fresh Take Inspired by Riri</h2>
      <p>Take inspiration from Rihanna's iconic style by pairing an oversized hoodie with statement accessories and confident attitude. Mix casual comfort with high fashion elements for a look that's uniquely yours.</p>
    `,
        excerpt: "Discover ultimate comfort and style with EasyJacket's collection of women hoodies. Keep reading to explore fantastic styling ideas.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Women Hoodies",
        featured: true,
        readTime: 5,
        createdAt: new Date("2025-05-26")
    },
    {
        title: "Design a Custom Jacket That's Uniquely Yours",
        slug: "design-a-custom-jacket-thats-uniquely-yours",
        content: `
      <p>Now that you've explored all the custom made jacket options Easy Jackets offers, all that's left is for you to choose your favorite!</p>
      
      <h2>Endless Customization – Design Your Custom Made Jacket</h2>
      <p>No matter your personal style, our wide range of customization options allows you to design a jacket that truly reflects your individuality. Whether you're going for a relaxed vibe, a sleek minimalist look, or bold contemporary streetwear, a custom-made jacket can bring your vision to life.</p>
      <p>Choose from a variety of body and sleeve colors, and decide between quilted or satin lining for ultimate comfort and luxury. Customize the acrylic knit on the cuffs, collar, and waistband in colors that match your personality. With our design options, you're free to experiment, express, and turn your creative ideas into a wearable masterpiece.</p>
      
      <h2>Extensive Range of Materials and Inclusive Sizing</h2>
      <p>At Easy Jackets, we offer you a creative canvas to bring your vision to life and showcase it with confidence. Our selection of high-quality materials spans from Cowhide Leather and Polyester Satin to Sheep Leather, Melton Wool, Cotton Fleece, and Cotton—each chosen for its durability and comfort.</p>
      <p>Every jacket is a unique creation, tailored to your preferences with premium materials and expert craftsmanship. We offer an inclusive size range from XXS to 6XL, ensuring a perfect fit for everyone. What truly sets our custom-made jackets apart is the opportunity for discovery and self-expression. They celebrate individuality and empower you to design something that's unmistakably yours.</p>
      
      <h2>Explore Our Full Range of Custom Jackets</h2>
      <p>Visit our website to explore varsity jackets, bomber jackets, letterman jackets, satin jackets, leather jackets, and more. Each style offers unique customization possibilities.</p>
    `,
        excerpt: "Now that you've explored all the custom made jacket options Easy Jackets offers, all that's left is for you to choose your favorite!",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Design Your Jacket",
        featured: true,
        readTime: 4,
        createdAt: new Date("2025-05-21")
    },
    {
        title: "A Concise History of the Letterman Jacket and Its Significance",
        slug: "a-concise-history-of-the-letterman-jacket-and-its-significance",
        content: `
      <p>It wasn't until 1930 that the letterman jacket evolved into the familiar collared, button-down style we recognize today.</p>
      
      <h2>The History and Beginnings of the Letterman Jacket</h2>
      <p>The origins of these legendary jackets date back more than 150 years to Harvard University's baseball team in Cambridge, Massachusetts, where in 1865 they wore grey flannel pullovers adorned with patches featuring the letter H, marking the creation of the first letterman jacket—though technically, it was a thick-knit sweater. A decade later, Harvard's football team adopted a similar tradition, creating their own lettered sweaters, further establishing the early roots of this enduring American sportswear tradition.</p>
      <p>Following its initial adoption, the letterman jacket gained an aura of exclusivity and prestige. Although all team members received the sweaters, only those with outstanding performance were permitted to keep theirs permanently, while benchwarmers were required to return their sweaters at season's end. This tradition elevated the jacket to a highly sought-after symbol of achievement and distinction.</p>
      <p>As cardigans replaced traditional sweaters, the placement of the lettering moved from the center to the left chest, marking a subtle change in style. This evolution helped solidify the letterman jacket's lasting influence on American culture, quickly extending beyond Ivy League schools to other colleges nationwide. Eventually, the tradition made its way into high schools across the country, becoming an iconic symbol of achievement and school spirit at all levels of education.</p>
      
      <h2>Modern Form of the Letterman Jacket</h2>
      <p>It wasn't until 1930 that the letterman jacket evolved into the familiar collared, button-down style we recognize today. These wool jackets, often featuring leather sleeves and chenille lettering, were designed to provide better warmth for athletes on the field. Despite these changes, the jacket maintained its status as a symbol of prestige and authority within schools. Over time, it became an essential part of the varsity athlete's wardrobe, cementing its place as a lasting emblem of athletic achievement.</p>
      
      <h2>Assimilation into Mainstream Culture</h2>
      <p>The letterman jacket transcended athletics to become a fashion staple, embraced by Hollywood and pop culture throughout the decades.</p>
      
      <h2>Contemporary Letterman Jacket</h2>
      <p>Today, letterman jackets continue to evolve while honoring their rich heritage, offering endless customization possibilities for individuals, teams, and organizations.</p>
    `,
        excerpt: "It wasn't until 1930 that the letterman jacket evolved into the familiar collared, button-down style we recognize today.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Letterman Jacket",
        featured: true,
        readTime: 6,
        createdAt: new Date("2025-05-18")
    },
    {
        title: "How to Style a Custom Varsity Jacket in 2025",
        slug: "how-to-style-a-custom-varsity-jacket-in-2025",
        content: `
      <p>Custom Varsity jacket come in an array of styles, from timeless, traditional designs to modern, personalized versions.</p>
      
      <h2>Selecting The Perfect Varsity Jacket</h2>
      <p>When choosing your varsity jacket, consider the material, fit, and style that best matches your personality and wardrobe needs.</p>
      
      <h2>How to Decorate a Custom Varsity Jacket?</h2>
      <p>Personalize your jacket with patches, embroidery, chenille letters, and custom graphics to make it uniquely yours.</p>
      
      <h2>10 Creative Ways to Style a Varsity Jacket</h2>
      
      <h3>1. SATIN: A Stylish Combination for a Trendy Look</h3>
      <p>Satin Varsity jackets boast a smooth, shiny, and luxurious finish that significantly elevates their style quotient. The glossy texture adds a touch of elegance and refinement, making the jacket stand out. For a balanced and fashionable look, combine your satin varsity jacket with denim bottoms, such as light-wash jeans or shorts, to create a casual yet chic vibe that radiates effortless sophistication.</p>
      
      <h3>2. Street Style Fleece Jackets</h3>
      <p>Street Style Fleece jackets are known for their exceptional softness and plush feel, providing a cozy yet luxurious comfort that feels gentle against the skin. To achieve a fashionable, relaxed look, style your fleece varsity with distressed jeans, a graphic tee, and trendy high-top sneakers. For added urban appeal, complete the outfit with a beanie or cap.</p>
      
      <h3>3. Monochromatic Blend: Coordinated Shades of a Leather-Sleeved Varsity Jacket</h3>
      <p>The pairing of leather sleeves with a classic melton wool body creates a striking mix of textures and styles. Opt for an all-black ensemble featuring a black leather-sleeved varsity jacket, paired with black jeans or leggings and edgy black ankle boots. To make your outfit pop, incorporate a bold accessory like a fiery red scarf or a standout handbag.</p>
      
      <h3>4. Rebel Vibe: Saint Laurent's Varsity Jacket Infused with a Rock 'n' Roll Attitude</h3>
      <p>A varsity jacket offers a perfect balance of traditional design and modern edge. Team it up with a vintage band t-shirt, distressed black jeans, and studded ankle boots, and add some personality with leather bracelets or a bold statement belt for an effortlessly stylish vibe.</p>
      
      <h3>5. Bomber Varsity Style</h3>
      <p>The bomber varsity style offers a contemporary twist on the classic varsity jacket, characterized by a zip-up front and a cropped silhouette for a streamlined, modern look. For a grunge-inspired outfit, pair your bomber varsity jacket with a band t-shirt, tie a plaid shirt around your waist, wear distressed denim, and complete the look with military-inspired boots.</p>
      
      <h3>6. RetroSity Varsity Style</h3>
      <p>When sporting a varsity jacket with bold prints or embroidery in vibrant colors, keep the rest of your outfit neutral to let the jacket stand out. Pair it with classic retro sneakers, high-waisted jeans, and vintage-style accessories to fully capture the nostalgic aesthetic.</p>
      
      <h3>7. Embracing the Trend of Oversized Varsity Jackets</h3>
      <p>Oversized varsity jackets are having a major moment. Style them with fitted bottoms to balance the proportions.</p>
      
      <h3>8. Hooded Varsity Jackets</h3>
      <p>Combine the classic varsity look with hoodie comfort for a versatile, streetwear-ready style.</p>
      
      <h3>9. Print Harmony in Camouflage</h3>
      <p>Camo-printed varsity jackets add a bold, military-inspired edge to any outfit.</p>
      
      <h3>10. Turn, Change, Wow</h3>
      <p>Reversible varsity jackets offer two looks in one, maximizing your styling options.</p>
    `,
        excerpt: "Custom Varsity jacket come in an array of styles, from timeless, traditional designs to modern, personalized versions.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Varsity Jacket",
        featured: false,
        readTime: 8,
        createdAt: new Date("2025-05-18")
    },
    {
        title: "Design Your Own Custom Jacket: Express Your Style with Every Stitch",
        slug: "design-your-own-custom-jacket-express-your-style-with-every-stitch",
        content: `
      <p>Design your own custom jacket is a bold step toward self-expression. Whether you're aiming for a sleek streetwear vibe or classic elegance, we make it possible.</p>
      
      <h2>Why Choose a Custom Jacket?</h2>
      
      <h3>1. Unique Style Statement</h3>
      <p>No one knows your style better than you do. A custom jacket allows you to showcase your personality—whether that's minimal and refined or loud and expressive. Want your initials embroidered on the sleeve? Prefer a specific fabric or color combination? The choice is entirely yours.</p>
      
      <h3>2. Perfect Fit</h3>
      <p>Mass-produced jackets often come with compromises in fit. With custom design, you can ensure that your jacket matches your body type, comfort preferences, and lifestyle.</p>
      
      <h3>3. Quality Over Quantity</h3>
      <p>Custom jackets are typically crafted with more care and better materials than off-the-rack options. You're investing in a garment that's not just stylish but durable—built to last through seasons and trends.</p>
      
      <h2>Steps to Create Your Own Design Jacket</h2>
      <p><strong>Step 1: Choose Your Jacket Type</strong> - Start with a base: varsity, denim, bomber, trench, biker, or hoodie-style. Think about what suits your wardrobe and daily needs.</p>
      <p><strong>Step 2: Select Materials and Colors</strong> - From rich leather and wool to breathable cotton and high-tech synthetics, your material choice sets the tone. Pick colors that reflect your style—or mix multiple shades for a bold, fashion-forward look.</p>
      <p><strong>Step 3: Customize the Details</strong> - Add elements like embroidery or printed graphics, custom patches or logos, zipper styles and button finishes, contrasting linings or stitch colors.</p>
      <p><strong>Step 4: Add Personal Touches</strong> - Include meaningful details: a quote inside the collar, a monogram on the cuff, or a symbol that represents something personal to you.</p>
      <p><strong>Step 5: Final Fitting and Finishing Touches</strong> - Work with your designer or tailor to ensure the fit is just right. This is where your jacket goes from concept to reality.</p>
      
      <h2>Top-notch Construction</h2>
      <p>When something is produced on a large scale, it is understood that quality won't be up to the mark. And that is why people who prefer quality over everything else choose to go with a custom leather jacket. The creation of a leather jacket tends to tell the tale whether it's exclusively made or mass-produced. Made-to-measure leather jackets at the EasyJackets scream quality construction by using the best available material from leather type to inner lining to zippers and studs; these bespoke jackets are the best investment.</p>
      
      <h2>Unlimited Variety</h2>
      <p>EasyJacket offers endless possibilities for customization, ensuring your jacket is one-of-a-kind.</p>
    `,
        excerpt: "Design your own custom jacket is a bold step toward self-expression. Whether you're aiming for a sleek streetwear vibe or classic elegance.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Design Your Jacket",
        featured: false,
        readTime: 6,
        createdAt: new Date("2025-05-06")
    },
    {
        title: "Where can I get High School Custom Varsity Jackets for Boys and Girls?",
        slug: "where-can-i-get-high-school-custom-varsity-jackets-for-boys-and-girls",
        content: `
      <p>Easy Jackets is world's largest supplier of custom Varsity jackets in USA, UK, Canada, Australia and Europe. We supply baseball satin jackets, wool and leather letterman jackets, and more.</p>
      
      <h2>Virgin Wool & Cow Leather Varsity Jackets</h2>
      <p>Virgin wool in 20+ shades and real leather sleeves in 30 shades lets you make very exclusive and premium quality letterman jackets. You have liberty to design your master piece. Our wool and leather varsity jackets are very popular in senior's class students, individuals and groups.</p>
      
      <h2>Satin Varsity Jackets</h2>
      <p>Additional popular product is satin varsity jackets. We use premium quality polyester satin fabric to manufacturer all our satin jackets. Satin is unique soft and shiny material. It is very popular between cheerleaders, women and baseball teams. We have more than 20 shades in satin jackets.</p>
      
      <h2>Cotton Fleece Varsity Jackets</h2>
      <p>Easy Jackets Custom cotton fleece jackets are affordable, easy to wash and discounted as compare to wool and leather varsity jackets. Popular in dance clubs, athletes and high school students. Use our jacket manufacturer to design your own custom jacket.</p>
      
      <h2>How to Design Your Private Letterman Jacket</h2>
      <ol>
        <li>Click on Design Your Jacket.</li>
        <li>Choose your choice of material combination for body and sleeves.</li>
        <li>Choose jacket sleeves cut and linings.</li>
        <li>Choose colors for body, sleeves, buttons, pockets, cuff and collars.</li>
        <li>Write your name and letters on chest.</li>
        <li>Write your numbers on sleeves.</li>
        <li>Upload your custom logo on back of your jacket.</li>
        <li>Save and select your jacket size.</li>
        <li>Make payment and let us bring your idea to life.</li>
      </ol>
      
      <h2>What's Next?</h2>
      <p>When you place your order, within 24 hours our manufacture team will start cutting fabrics of your custom varsity jacket. Our designers will digitize your names, letters and patches. Your custom designs jacket will be digitize too. It takes hours to digitize all custom patches, embroideries and logos.</p>
      <p>After cutting and digitizing embroidery process take place. It's not easy as it seems, an embroidery design can take unto 10 hours to complete. It depends how big / difficult the design is. Once embroidery process is completed, jacket will go into stitching process. Our skilled stitches will stitch your jacket and will attach all your custom patches on the requested locations.</p>
      <p>Once jacket is completely stitched, quality control department will inspect your jacket and if it's perfectly made. We will add front shatters. Once is ready to dispatch, our professional photographer will take photos of the jacket and will upload on Dropbox. We sent link to our customers so they can inspect their jacket and if there is any fault (human error) it will be resolved / fixed before ship.</p>
      <p>Once customer grant approval we ship jacket using well known currier companies like Fedex or DHL. A notification of the shipment goes directly to the mobile of customer. Express shipping takes 4-5 working days and you have your awesome custom made varsity jacket in your hands.</p>
    `,
        excerpt: "Easy Jackets is world's largest supplier of custom Varsity jackets in USA, UK, Canada, Australia and Europe.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Varsity Jacket",
        featured: false,
        readTime: 7,
        createdAt: new Date("2025-04-12")
    },

    // ========== PAGE 2 BLOGS ==========
    {
        title: "Custom Made Letterman Jackets for Girls 2025",
        slug: "custom-made-letterman-jackets-for-girls-2025",
        content: `
      <p>Easy Jackets deal high quality premium custom letterman jackets for girls. We offer premium range of custom varsity jackets for individuals.</p>
      
      <h3>Girls School Jackets</h3>
      <p>The high school custom varsity jackets with girls name and senior class year patches. Designed for senior class of 2025.</p>
      
      <h3>Girls in Letterman Jackets</h3>
      <p>If you love sports and often participate in high school actions. You might have seen girls in custom letterman jackets. Here are few photos and pictures shared by our customers.</p>
      
      <h3>Letter Jackets for Girls</h3>
      <p>We manufactured satin letter jackets for girls in USA. They decided to have their own logo on the back as felt patch.</p>
      
      <h3>High School Letterman Jacket Concepts</h3>
      <p>Here are few jackets we manufactured to give concept about high school letterman jackets.</p>
      
      <h2>Custom Letterman Jackets</h2>
      <p>Design your perfect custom letterman jacket with Easy Jackets. Choose from wool, leather, satin, and fleece materials in countless color combinations.</p>
    `,
        excerpt: "Easy Jackets deal high quality premium custom letterman jackets for girls. We offer premium range of custom varsity jackets for individuals.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Letterman Jacket",
        featured: false,
        readTime: 4,
        createdAt: new Date("2025-04-07")
    },
    {
        title: "Pink Melton Wool Custom Varsity Jackets for Girls 2025",
        slug: "pink-melton-wool-custom-varsity-jackets-for-girls-2025",
        content: `
      <p>Prepared to create your perfect Pink Melton Wool Custom Varsity Jackets for girls? Explore Easy Jackets's collection of varsity jackets.</p>
      
      <h2>1. Pink Cotton Fleece Varsity Jackets: Structures and Benefits</h2>
      <p>Pink fleece varsity jackets combine style and purpose. Here's why they're a great addition to your clothing:</p>
      <ul>
        <li><strong>Warm & Relaxed:</strong> Pink Cotton fleece is lightweight yet provides excellent lining.</li>
        <li><strong>Fashionable Look:</strong> The varsity design, paired with pink, adds a feminine touch.</li>
        <li><strong>Robust Fabric:</strong> Cotton fleece is soft yet strong, perfect for long-term wear.</li>
        <li><strong>Breathable Material:</strong> Keeps you warm without overheating during light activities.</li>
      </ul>
      
      <h3>Why Select a Pink Fleece Jacket?</h3>
      <p>Pink jackets make a statement while providing comfort and warmth. Perfect for school spirit, team unity, or personal style expression.</p>
      
      <h2>2. Uses of Fleece Varsity Jackets for Girls</h2>
      <p>Fleece varsity jackets are versatile for school events, cheerleading, dance teams, casual outings, and more.</p>
      
      <h2>3. Available Sizes for Pink Varsity Jackets</h2>
      <p>We offer sizes from XXS to 6XL, ensuring a perfect fit for everyone.</p>
      
      <h2>4. Design Options at Easy Jackets</h2>
      <p>Customize your pink varsity jacket with patches, embroidery, names, numbers, and logos. Use our online jacket builder to create your perfect design.</p>
    `,
        excerpt: "Prepared to create your perfect Pink Melton Wool Custom Varsity Jackets for girls? Explore Easy Jackets's collection of varsity jackets.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Varsity Jacket",
        featured: false,
        readTime: 5,
        createdAt: new Date("2025-04-04")
    },
    {
        title: "Custom Made Senior Jackets Class for 2025",
        slug: "custom-made-senior-jackets-class-for-2025",
        content: `
      <p>We are here to produce custom made senior jackets Class for 2025 seniors. Use our online jacket builder to create your senior class jackets.</p>
      
      <h2>Premium Quality Custom School Jackets</h2>
      <p>Easy Jackets is reliable manufacturer and supplier of custom varsity jackets. Excessive quality, affordability and speedy delivery are our pride. We use superior quality materials to make customized varsity jackets. Every year we manufacture thousands of custom jackets for high school senior class students, teams, individuals and clothing lines. Use our online jacket builder to design your own varsity jacket. Our state of the art custom jacket builder lets you design your own dream jacket in couple of minutes.</p>
      
      <h2>Seniors Class Student of 2025 Jackets</h2>
      <p>If you are looking to symbolize your school's senior class you are in the correct place. We are here to produce best letterman jackets for class of 2025, 2026 and 2027 seniors. Use our online jacket builder to create your custom made senior class jackets. Add letterman patches, mascots and names. Quick turnaround and fastest delivery. We offer discount. Get free quote for your senior letterman jackets.</p>
      
      <h3>Custom Satin Jackets, Baseball Team Jackets</h3>
      <p>In addition to wool and leather options, we offer satin varsity jackets perfect for baseball teams, cheerleaders, and dance groups.</p>
    `,
        excerpt: "We are here to produce custom made senior jackets Class for 2025 seniors. Use our online jacket builder to create your senior class jackets.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Varsity Jacket",
        featured: false,
        readTime: 4,
        createdAt: new Date("2025-03-24")
    },
    {
        title: "Styles of Letterman Jackets – A Complete Guide 2025",
        slug: "styles-of-letterman-jackets-a-complete-guide-2025",
        content: `
      <p>The Letterman jackets or custom varsity jackets show school or college pride, accomplishment and sporty success.</p>
      
      <h2>Letterman Jacket's Style 2025:</h2>
      <ol>
        <li><strong>Classic Letterman Jacket 2025:</strong> The classic varsity jacket including a wool body and leather sleeves. The Melton wool and leather provides warmth and durability, making it a great choice for colder weather.</li>
        <li><strong>Hooded Varsity Jacket 2025:</strong> The hooded version of the varsity jacket adds a casual twist to the traditional look. With a zipper or snap conclusion and a comfortable hood, this style blends fashion with functionality.</li>
        <li><strong>Retro Letterman Jacket 2025:</strong> Inspired by designs from past periods, typically the 80s or earlier. It often features a shirt collar instead of the more modern ribbed or hooded styles.</li>
        <li><strong>Full-Zipper Letterman Jacket 2025:</strong> The full-zipper letterman jacket is a more modern take on the traditional design. With a zipper running the entire length of the front, it offers a smooth and practical option for easy wear.</li>
      </ol>
      
      <h2>Types of Letterman Jacket's Materials:</h2>
      <ol>
        <li><strong>Wool Body with Leather Sleeves:</strong> The utmost modern type of varsity jacket. Typically made with a wool body and cowhide leather sleeves. This combination provides durability and a sharp look.</li>
        <li><strong>Wool Body with Faux Leather Sleeves:</strong> For those seeking an alternative to leather, offering the same traditional look but more affordable and animal-friendly.</li>
        <li><strong>All-Wool Letterman Jacket 2025:</strong> Features an all-Melton wool blend, giving a warm and cozy feel. Perfect for colder weather.</li>
        <li><strong>Cotton Letterman Jacket 2025:</strong> A lighter option, perfect for warmer weather or casual wear. Made completely of cotton fleece fabric.</li>
        <li><strong>Synthetic Letterman Jacket 2025:</strong> Made from supplies like polyester satin, poly cotton twill and soft-shell. Lightweight, easy to wear, and often more reasonable.</li>
      </ol>
      
      <h2>Letterman Jacket's Decorations Options:</h2>
      <ol>
        <li><strong>Chenille Letterman Jacket 2025:</strong> Features chenille patches and embroidery, making a soft, raised texture.</li>
        <li><strong>Embroidered Letterman Jacket 2025:</strong> Features tailored embroidery with designs and names stitched directly onto the jacket.</li>
        <li><strong>Felt and Twill Letters Letterman Jacket 2025:</strong> Featuring letters and symbols made from felt and Twill material, giving a smooth, classic finish.</li>
        <li><strong>Sublimated Varsity Jacket 2025:</strong> A modern alternative with designs printed directly onto the fabric.</li>
      </ol>
      
      <h2>Select Letterman Jacket's By Purpose:</h2>
      <p>Choose your jacket based on your needs: high school spirit, team uniforms, graduation commemorations, or fashion statements.</p>
      
      <h2>Other Variations of Letterman Jacket's:</h2>
      <p>Explore bomber varsity, oversized fits, cropped styles, and reversible options for unique looks.</p>
    `,
        excerpt: "The Letterman jackets or custom varsity jackets show school or college pride, accomplishment and sporty success.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Letterman Jacket",
        featured: false,
        readTime: 8,
        createdAt: new Date("2025-03-23")
    },
    {
        title: "Step by Step Guideline: How to Design Your Varsity Jacket Online 2025?",
        slug: "step-to-step-guideline-how-to-design-your-varsity-jacket-online-2025",
        content: `
      <p>When design a custom Varsity jacket, you have to be assured of the color combinations, which material would be meet, and the presence.</p>
      
      <h2>Let's Start Design a Varsity Jacket Online</h2>
      <p>Creating your dream varsity jacket has never been easier with our online jacket builder.</p>
      
      <h2>Step-to-Step Guideline: How to Design?</h2>
      
      <h3>Step 1: Stay with EasyJackets Website</h3>
      <p>Come to the homepage and select "Jacket Builder" from the menu, then click "Design Your Jackets."</p>
      
      <h3>Step 2: Choose Your Materials</h3>
      <p>Choice supplies like Melton wool, cowhide leather, faux leather or polyester satin for the body and sleeves. We offer wide range of Materials & Colors choices.</p>
      
      <h3>Step 3: Make to order Styles</h3>
      <p>Pick sleeve, pocket, and collar styles. Your selections will update the jacket design in real-time. Browse our Jackets Range online.</p>
      
      <h3>Step 4: Add Personal Touches</h3>
      <p>Pick colors, add patches, write names & letters or even upload your school's mascot or logo design.</p>
      
      <h3>Step 5: Select Your Size</h3>
      <p>Make sure a perfect fit by choosing the exact size using our Sizing Guideline. We offer sizes ranging from XS to 6XL, with options for both regular and tall unisex fits.</p>
      
      <h3>Step 6: Confirm and Order</h3>
      <p>Analyze your design, place your order, and make any changes within 24 hours if needed.</p>
      
      <h3>Step 7: Get Your Jacket</h3>
      <p>Be your own designer and design the Varsity jacket of your dreams. With EasyJackets unified manufacturing and delivery services, we promise to deliver you the best quality product considering your requirements. We will craft and transport your custom varsity jacket with care and attention to detail.</p>
      
      <h2>Design Varsity Jacket with EasyJackets Experts</h2>
      <p>Become started today and design a varsity jacket that reflects your personal style with EasyJackets!</p>
    `,
        excerpt: "When design a custom Varsity jacket, you have to be assured of the color combinations, which material would be meet, and the presence.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Design Your Jacket",
        featured: false,
        readTime: 5,
        createdAt: new Date("2025-01-26")
    },
    {
        title: "How Much the Cost Of Varsity Or Letterman Jackets Cost in 2025?",
        slug: "how-much-the-cost-of-varsity-or-letterman-jackets-cost-in-2025",
        content: `
      <p>Our simple jacket builder, you can design a varsity jacket that stands out and shows your unique style. Make your custom varsity jacket today.</p>
      
      <h2>What Marks the Cost of a Varsity Jacket?</h2>
      <p>The price of a varsity jacket can differ based on several factors:</p>
      <ul>
        <li><strong>Used Of Materials:</strong> Varsity jackets are made from different materials like wool, leather and cotton fleece. High quality premium materials like genuine original leather and high-quality wool will cost more than artificial options. At EasyJackets, we offer a variety of material choices to fit your needs and budget.</li>
        <li><strong>Design Options:</strong> If you're designing a custom made jacket, the cost will increase based on the specifics you add. Patches, embroidery and logos all affect the final cost. The more flags you choose, the higher the cost. However, EasyJackets offers competitive pricing and discounts.</li>
        <li><strong>Jacket Size:</strong> XL, XXL, XXXL Larger sizes may cost slightly more because of the extra materials needed. At EasyJackets, we offer sizes from XS to 6XL, including regular and tall unisex sizes.</li>
        <li><strong>Average Cost of a Jacket:</strong> At EasyJackets, our varsity jackets range in cost depending on the options you choose. A basic jacket starts at around $95 to $145. If you opt for finest materials like genuine leather sleeves or add detailed customization, the cost can go up to $250 or more. However, we constantly offer discounts and deals.</li>
      </ul>
      
      <h2>How to Modify Your Varsity Jacket?</h2>
      <p>Modifying a varsity jacket at EasyJackets is easy. Our Jacket Builder lets you choose everything from the fabric and colors to patches and closures. Here's a quick guide to customizing your jacket:</p>
      <ol>
        <li><strong>Choose Materials:</strong> Select from options like Melton wool, leather sleeves or faux leather for the body and sleeves.</li>
        <li><strong>Pick Colors:</strong> Choose the perfect color combination to match your style or school colors.</li>
        <li><strong>Add Patches and Embroidery:</strong> Customize with your name, school logo, graduation year or personal symbols.</li>
        <li><strong>Select Closure and Collar Styles:</strong> Select between buttons or zippers and pick your preferred collar type.</li>
        <li><strong>Check Cost:</strong> As you customize, the system updates the price in real-time, allowing you to keep track of your budget.</li>
      </ol>
      
      <h2>Delivery and Order Selections</h2>
      <p>Once you've designed your varsity jacket, you can expect it to arrive at your doorstep within 10-15 business days. EasyJackets also offers a 24-hour window to make changes to your order, so you can adjust your design if needed.</p>
      
      <h2>Reasonable Varsity Jackets</h2>
      <p>EasyJackets offers premium quality jackets at competitive prices with regular discounts and promotions.</p>
    `,
        excerpt: "Our simple jacket builder, you can design a varsity jacket that stands out and shows your unique style. Make your custom varsity jacket today.",
        image: "https://easyjackets.com/logo.webp",
        author: "Easy Jackets",
        category: "Varsity Jacket",
        featured: false,
        readTime: 6,
        createdAt: new Date("2025-01-25")
    }
];

const seedBlogs = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URL || 'mongodb://localhost:27017/easyjackets';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing blogs and insert fresh data
        await Blog.deleteMany({});
        console.log('Cleared existing blogs');

        // Insert new blogs
        for (const blog of blogs) {
            await Blog.create(blog);
            console.log(`✅ Created: ${blog.title}`);
        }

        console.log('\n🎉 Blog seed completed successfully! 12 blogs added.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding blogs:', error);
        process.exit(1);
    }
};

seedBlogs();
